import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, SafeAreaView, RefreshControl, Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";

const C = {
  bg: "#0D1117", card: "#0F1A0F", green: "#63B528",
  amber: "#EF9F27", purple: "#7F77DD", blue: "#38BDF8", red: "#F87171",
  text: "#F0F0EC", muted: "rgba(240,240,236,0.4)",
  border: "rgba(45,90,45,0.3)",
};

const CATEGORIAS: Record<string, { emoji: string; color: string }> = {
  content:  { emoji: "🎬", color: C.green },
  finance:  { emoji: "💰", color: C.amber },
  learning: { emoji: "📚", color: C.purple },
  social:   { emoji: "🤝", color: C.blue },
  health:   { emoji: "⚡", color: C.red },
};

function tiempoDesde(fecha: string) {
  const s = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

interface Comunidad {
  id: string; name: string; slug: string; description: string;
  category: string; member_count: number; is_verified: boolean;
}
interface Post {
  id: string; content: string; likes_count: number; created_at: string;
  autor?: { username: string; full_name: string; level: number };
}

export default function ComunidadesScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [unidas, setUnidas] = useState<string[]>([]);
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState<Comunidad | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [nuevoPost, setNuevoPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: comms }, { data: memberships }] = await Promise.all([
      supabase.from("communities").select("*").order("member_count", { ascending: false }),
      supabase.from("community_members").select("community_id").eq("user_id", user.id),
    ]);

    setComunidades(comms ?? []);
    setUnidas((memberships ?? []).map((m: { community_id: string }) => m.community_id));
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  }, [cargar]);

  async function abrirComunidad(comunidad: Comunidad) {
    setComunidadSeleccionada(comunidad);
    setLoadingPosts(true);

    const { data: postData } = await supabase
      .from("posts")
      .select("id, content, likes_count, created_at, user_id")
      .eq("community_id", comunidad.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (postData && postData.length > 0) {
      const userIds = [...new Set(postData.map((p: { user_id: string }) => p.user_id))];
      const { data: autores } = await supabase
        .from("users")
        .select("id, username, full_name, level")
        .in("id", userIds);

      const mapaAutores = Object.fromEntries(
        (autores ?? []).map((a: { id: string; username: string; full_name: string; level: number }) => [a.id, a])
      );

      setPosts(postData.map((p: { id: string; content: string; likes_count: number; created_at: string; user_id: string }) => ({
        ...p, autor: mapaAutores[p.user_id],
      })));
    } else {
      setPosts([]);
    }
    setLoadingPosts(false);
  }

  async function toggleMembresia(comunidad: Comunidad) {
    if (!userId) return;
    const esMiembro = unidas.includes(comunidad.id);

    if (esMiembro) {
      await supabase.from("community_members")
        .delete()
        .eq("community_id", comunidad.id)
        .eq("user_id", userId);
      setUnidas(prev => prev.filter(id => id !== comunidad.id));
    } else {
      await supabase.from("community_members").insert({
        community_id: comunidad.id, user_id: userId, role: "member",
      });
      setUnidas(prev => [...prev, comunidad.id]);
    }
  }

  async function publicar() {
    if (!nuevoPost.trim() || !comunidadSeleccionada || !userId || publicando) return;
    setPublicando(true);

    const { data, error } = await supabase.from("posts").insert({
      community_id: comunidadSeleccionada.id,
      user_id: userId,
      content: nuevoPost.trim(),
      likes_count: 0, comments_count: 0,
    }).select().single();

    if (error) {
      Alert.alert("Error", "No se pudo publicar. Intenta de nuevo.");
    } else if (data) {
      setPosts(prev => [{ ...data, autor: { username: "tú", full_name: "Tú", level: 1 } }, ...prev]);
      setNuevoPost("");
    }
    setPublicando(false);
  }

  async function reaccionar(postId: string) {
    if (!userId) return;
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    const post = posts.find(p => p.id === postId);

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
      await supabase.from("posts").update({ likes_count: Math.max(0, (post?.likes_count ?? 1) - 1) }).eq("id", postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: userId, type: "like" });
      await supabase.from("posts").update({ likes_count: (post?.likes_count ?? 0) + 1 }).eq("id", postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.green} size="large" />
      </View>
    );
  }

  // ── Vista de comunidad ──
  if (comunidadSeleccionada) {
    const cat = CATEGORIAS[comunidadSeleccionada.category] ?? CATEGORIAS.content;

    return (
      <SafeAreaView style={s.container}>
        {/* Header */}
        <View style={[s.feedHeader, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => setComunidadSeleccionada(null)} style={s.backBtn}>
            <Text style={{ color: C.muted, fontSize: 22 }}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.feedTitle}>{cat.emoji} {comunidadSeleccionada.name}</Text>
            <Text style={{ color: C.muted, fontSize: 11 }}>
              👥 {comunidadSeleccionada.member_count} miembros
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {/* Composer */}
          <View style={s.card}>
            <TextInput
              style={[s.input, { minHeight: 72, textAlignVertical: "top", paddingTop: 10 }]}
              value={nuevoPost}
              onChangeText={setNuevoPost}
              placeholder="¿Qué estás logrando hoy?"
              placeholderTextColor="rgba(240,240,236,0.25)"
              multiline
            />
            <TouchableOpacity
              style={[s.publishBtn, !nuevoPost.trim() && { opacity: 0.4 }]}
              onPress={publicar}
              disabled={!nuevoPost.trim() || publicando}
            >
              {publicando
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Publicar</Text>}
            </TouchableOpacity>
          </View>

          {/* Posts */}
          {loadingPosts ? (
            <ActivityIndicator color={C.green} style={{ marginTop: 32 }} />
          ) : posts.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 48 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>{cat.emoji}</Text>
              <Text style={{ color: C.muted }}>Sé el primero en publicar</Text>
            </View>
          ) : (
            posts.map(post => (
              <View key={post.id} style={[s.card, { marginBottom: 12 }]}>
                {/* Autor */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <View style={[s.authorAvatar, { borderColor: cat.color }]}>
                    <Text style={{ color: cat.color, fontWeight: "700", fontSize: 13 }}>
                      {post.autor?.full_name?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }}>
                      {post.autor?.full_name ?? "Usuario"}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 11 }}>
                      @{post.autor?.username ?? "?"} · {tiempoDesde(post.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Contenido */}
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 22, marginBottom: 12 }}>
                  {post.content}
                </Text>

                {/* Acciones */}
                <TouchableOpacity
                  onPress={() => reaccionar(post.id)}
                  style={s.likeBtn}
                >
                  <Text style={{ fontSize: 16 }}>❤️</Text>
                  {post.likes_count > 0 && (
                    <Text style={{ color: C.muted, fontSize: 12 }}>{post.likes_count}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Vista de lista ──
  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green} />}
      >
        <Text style={s.pageTitle}>Comunidades 👥</Text>
        <Text style={s.pageSub}>Conecta con personas con los mismos objetivos</Text>

        {comunidades.map(comunidad => {
          const cat = CATEGORIAS[comunidad.category] ?? CATEGORIAS.content;
          const esMiembro = unidas.includes(comunidad.id);

          return (
            <View key={comunidad.id} style={s.commCard}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                <View style={[s.commIcon, { backgroundColor: `${cat.color}18` }]}>
                  <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "700", fontSize: 15 }}>{comunidad.name}</Text>
                  <Text style={{ color: C.muted, fontSize: 12, marginTop: 3, lineHeight: 18 }} numberOfLines={2}>
                    {comunidad.description}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>
                    👥 {comunidad.member_count} miembros
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                <TouchableOpacity
                  style={[s.verBtn, { borderColor: cat.color }]}
                  onPress={() => abrirComunidad(comunidad)}
                >
                  <Text style={{ color: cat.color, fontWeight: "600", fontSize: 13 }}>Ver feed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.joinBtn, esMiembro && { backgroundColor: "rgba(99,181,40,0.15)" }]}
                  onPress={() => toggleMembresia(comunidad)}
                >
                  <Text style={{ color: esMiembro ? C.green : "#fff", fontWeight: "700", fontSize: 13 }}>
                    {esMiembro ? "✓ Unido" : "Unirse"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: "800", marginBottom: 4 },
  pageSub: { color: C.muted, fontSize: 13, marginBottom: 20 },
  card: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14,
  },
  commCard: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12,
  },
  commIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  verBtn: {
    flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 8,
    alignItems: "center",
  },
  joinBtn: {
    flex: 1, backgroundColor: C.green, borderRadius: 20, paddingVertical: 8,
    alignItems: "center",
  },
  feedHeader: {
    flexDirection: "row", alignItems: "center", padding: 16,
    borderBottomWidth: 1, gap: 12,
  },
  backBtn: { padding: 4 },
  feedTitle: { color: C.text, fontSize: 16, fontWeight: "700" },
  input: {
    backgroundColor: "#1a2e1a", borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: C.text, fontSize: 14,
  },
  publishBtn: {
    backgroundColor: C.green, borderRadius: 20, paddingVertical: 8,
    paddingHorizontal: 20, alignSelf: "flex-end", marginTop: 10,
  },
  authorAvatar: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    backgroundColor: "rgba(99,181,40,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  likeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
  },
  muted: { color: C.muted, fontSize: 12 },
});
