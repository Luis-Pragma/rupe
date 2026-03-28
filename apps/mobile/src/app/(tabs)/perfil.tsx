import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

const C = {
  bg: "#0D1117", card: "#0F1A0F", green: "#63B528",
  amber: "#EF9F27", purple: "#7F77DD", gold: "#FFD700",
  text: "#F0F0EC", muted: "rgba(240,240,236,0.4)",
  border: "rgba(45,90,45,0.3)",
};

const NIVELES = [
  { nombre: "Semilla", xpMin: 0 }, { nombre: "Brote", xpMin: 500 },
  { nombre: "Raíz", xpMin: 1200 }, { nombre: "Tallo", xpMin: 2500 },
  { nombre: "Hoja", xpMin: 4500 }, { nombre: "Rama", xpMin: 7500 },
  { nombre: "Copa", xpMin: 12000 }, { nombre: "Árbol", xpMin: 18000 },
  { nombre: "Bosque", xpMin: 27000 }, { nombre: "Ecosistema", xpMin: 40000 },
];

const CATEGORIAS = [
  { id: "content", label: "Contenido", emoji: "🎬", color: C.green },
  { id: "finance", label: "Finanzas", emoji: "💰", color: C.amber },
  { id: "learning", label: "Aprendizaje", emoji: "📚", color: C.purple },
  { id: "social", label: "Social", emoji: "🤝", color: "#38BDF8" },
  { id: "health", label: "Salud", emoji: "⚡", color: "#F87171" },
];

function getNivelInfo(xp: number) {
  let actual = NIVELES[0], siguiente = NIVELES[1];
  for (let i = 0; i < NIVELES.length; i++) {
    if (xp >= NIVELES[i].xpMin) { actual = NIVELES[i]; siguiente = NIVELES[i + 1] ?? NIVELES[9]; }
  }
  const progreso = Math.min(100, ((xp - actual.xpMin) / (siguiente.xpMin - actual.xpMin)) * 100);
  return { actual, siguiente, progreso };
}

function levelColor(level: number) {
  if (level <= 3) return C.green;
  if (level <= 6) return C.amber;
  if (level <= 8) return C.purple;
  return C.gold;
}

function tiempoDesde(fecha: string) {
  const s = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

interface Actividad {
  id: string; title: string; category: string; xp_earned: number; created_at: string;
}

export default function PerfilScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    username: string; full_name: string; xp: number; level: number;
    streak_days: number; tagline: string | null;
  } | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [totalActs, setTotalActs] = useState(0);
  const [insignias, setInsignias] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/(auth)/login"); return; }

    const [{ data: ud }, { data: profile }, { data: acts }, { count }] = await Promise.all([
      supabase.from("users").select("username, full_name, xp, level, streak_days").eq("id", user.id).single(),
      supabase.from("profiles").select("tagline").eq("user_id", user.id).maybeSingle(),
      supabase.from("activities").select("id, title, category, xp_earned, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("activities").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    const { count: badgeCount } = await supabase
      .from("achievements")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setUserData({ ...ud!, tagline: profile?.tagline ?? null });
    setActividades(acts ?? []);
    setTotalActs(count ?? 0);
    setInsignias(badgeCount ?? 0);
    setLoading(false);
  }, [router]);

  useEffect(() => { cargar(); }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  }, [cargar]);

  async function cerrarSesion() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir", style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.green} size="large" />
      </View>
    );
  }

  const { actual, siguiente, progreso } = getNivelInfo(userData!.xp);
  const lc = levelColor(userData!.level);

  // Calcular XP por categoría
  const xpPorCat: Record<string, number> = {};
  actividades.forEach(a => {
    xpPorCat[a.category] = (xpPorCat[a.category] ?? 0) + a.xp_earned;
  });
  const maxCatXP = Math.max(...Object.values(xpPorCat), 1);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green} />}
      >
        {/* ── Hero ── */}
        <View style={s.hero}>
          {/* Avatar */}
          <View style={[s.avatarRing, { borderColor: lc }]}>
            <Text style={{ color: lc, fontSize: 32, fontWeight: "800" }}>
              {userData!.full_name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>

          {/* Level badge */}
          <View style={[s.levelBadge, { backgroundColor: lc }]}>
            <Text style={{ color: "#0D1117", fontSize: 10, fontWeight: "800" }}>
              Nv {userData!.level}
            </Text>
          </View>

          <Text style={s.name}>{userData!.full_name}</Text>
          <Text style={[s.handle, { color: C.green }]}>@{userData!.username}</Text>
          {userData!.tagline && (
            <Text style={s.tagline}>{userData!.tagline}</Text>
          )}
          <Text style={[s.levelName, { color: lc }]}>{actual.nombre}</Text>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          {[
            { label: "XP Total", valor: userData!.xp.toLocaleString(), icon: "⚡", color: C.green },
            { label: "Racha", valor: `${userData!.streak_days}d`, icon: "🔥", color: C.amber },
            { label: "Actividades", valor: totalActs.toString(), icon: "📊", color: C.purple },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { borderColor: `${stat.color}25` }]}>
              <Text style={{ fontSize: 18 }}>{stat.icon}</Text>
              <Text style={[s.statNum, { color: stat.color }]}>{stat.valor}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Nivel progress ── */}
        <View style={s.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: C.muted, fontSize: 12 }}>Progreso al nivel {userData!.level + 1}</Text>
            <Text style={{ color: lc, fontSize: 12, fontWeight: "700" }}>{Math.round(progreso)}%</Text>
          </View>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${progreso}%` as `${number}%`, backgroundColor: lc }]} />
          </View>
          <Text style={[s.muted, { marginTop: 6, fontSize: 11 }]}>
            {(siguiente.xpMin - userData!.xp).toLocaleString()} XP para {siguiente.nombre}
          </Text>
        </View>

        {/* ── Insignias ── */}
        <TouchableOpacity style={s.quickBtn}>
          <Text style={{ fontSize: 22 }}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>Insignias</Text>
            <Text style={s.muted}>{insignias} desbloqueadas</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 20 }}>›</Text>
        </TouchableOpacity>

        {/* ── Progreso por área ── */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Progreso por área</Text>
          {CATEGORIAS.map(cat => {
            const xp = xpPorCat[cat.id] ?? 0;
            const pct = (xp / maxCatXP) * 100;
            return (
              <View key={cat.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ color: C.text, fontSize: 12 }}>
                    {cat.emoji} {cat.label}
                  </Text>
                  <Text style={{ color: cat.color, fontSize: 12, fontWeight: "600" }}>
                    {xp.toLocaleString()} XP
                  </Text>
                </View>
                <View style={s.barBg}>
                  <View style={[s.barFill, {
                    width: pct > 0 ? `${pct}%` as `${number}%` : "2%",
                    backgroundColor: cat.color
                  }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Actividad reciente ── */}
        {actividades.slice(0, 8).length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Actividad reciente</Text>
            {actividades.slice(0, 8).map(act => {
              const cat = CATEGORIAS.find(c => c.id === act.category);
              return (
                <View key={act.id} style={s.actItem}>
                  <Text style={{ fontSize: 16 }}>{cat?.emoji ?? "⚡"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontSize: 12, fontWeight: "600" }} numberOfLines={1}>
                      {act.title}
                    </Text>
                    <Text style={s.muted}>{tiempoDesde(act.created_at)}</Text>
                  </View>
                  <Text style={{ color: C.green, fontSize: 12, fontWeight: "700" }}>
                    +{act.xp_earned}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Cerrar sesión ── */}
        <TouchableOpacity style={s.signOutBtn} onPress={cerrarSesion}>
          <Text style={{ color: "#F87171", fontWeight: "600", fontSize: 14 }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 20, position: "relative" },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 3,
    backgroundColor: "rgba(99,181,40,0.1)",
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  levelBadge: {
    position: "absolute", top: 56, right: "30%",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  name: { color: C.text, fontSize: 22, fontWeight: "800", marginBottom: 2 },
  handle: { fontSize: 14, marginBottom: 4 },
  tagline: { color: C.muted, fontSize: 13, textAlign: "center", marginBottom: 4 },
  levelName: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, padding: 12, alignItems: "center", gap: 3,
  },
  statNum: { fontSize: 18, fontWeight: "800" },
  statLabel: { color: C.muted, fontSize: 10 },
  card: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12,
  },
  barBg: { height: 5, borderRadius: 3, backgroundColor: "rgba(99,181,40,0.1)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  quickBtn: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)", padding: 14, marginBottom: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  sectionTitle: {
    color: C.muted, fontSize: 10, textTransform: "uppercase",
    letterSpacing: 2, marginBottom: 12,
  },
  actItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(45,90,45,0.1)",
  },
  signOutBtn: {
    borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
    borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  muted: { color: C.muted, fontSize: 11 },
});
