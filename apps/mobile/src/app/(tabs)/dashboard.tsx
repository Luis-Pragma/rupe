import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, SafeAreaView,
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

const CAT_EMOJI: Record<string, string> = {
  content: "🎬", finance: "💰", learning: "📚", social: "🤝", health: "⚡",
};

function getNivelInfo(xp: number) {
  let actual = NIVELES[0], siguiente = NIVELES[1];
  for (let i = 0; i < NIVELES.length; i++) {
    if (xp >= NIVELES[i].xpMin) { actual = NIVELES[i]; siguiente = NIVELES[i + 1] ?? NIVELES[9]; }
  }
  const progreso = ((xp - actual.xpMin) / (siguiente.xpMin - actual.xpMin)) * 100;
  return { actual, siguiente, progreso: Math.min(100, progreso) };
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

interface UserData {
  username: string; full_name: string; xp: number; level: number; streak_days: number;
}
interface Actividad {
  id: string; title: string; category: string; xp_earned: number; created_at: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/(auth)/login"); return; }

    const [{ data: ud }, { data: acts }] = await Promise.all([
      supabase.from("users").select("username, full_name, xp, level, streak_days").eq("id", user.id).single(),
      supabase.from("activities").select("id, title, category, xp_earned, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    ]);

    if (!ud?.username) { router.replace("/onboarding"); return; }
    setUserData(ud);
    setActividades(acts ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { cargar(); }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  }, [cargar]);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.green} size="large" />
      </View>
    );
  }

  const { actual, siguiente, progreso } = getNivelInfo(userData!.xp);
  const lc = levelColor(userData!.level);
  const hoy = new Date().toISOString().split("T")[0];
  const actHoy = actividades.filter(a => a.created_at.startsWith(hoy)).length;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green} />}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>RUPE</Text>
          </View>
          <View style={s.avatar}>
            <Text style={{ color: C.green, fontWeight: "700", fontSize: 15 }}>
              {userData!.full_name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        </View>

        {/* ── Saludo ── */}
        <Text style={s.muted}>Bienvenido de vuelta 👋</Text>
        <Text style={s.name}>{userData!.full_name}</Text>
        <Text style={[s.username, { color: C.green }]}>@{userData!.username}</Text>

        {/* ── Nivel Card ── */}
        <View style={s.card}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <View>
              <Text style={[s.label, { color: lc }]}>NIVEL {userData!.level}</Text>
              <Text style={[s.bigText, { color: C.text }]}>{actual.nombre}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: C.green, fontSize: 26, fontWeight: "800" }}>
                {userData!.xp.toLocaleString()}
              </Text>
              <Text style={s.muted}>XP total</Text>
            </View>
          </View>

          {/* Barra de progreso */}
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${progreso}%` as `${number}%`, backgroundColor: lc }]} />
          </View>
          <Text style={[s.muted, { marginTop: 4, fontSize: 11 }]}>
            {(siguiente.xpMin - userData!.xp).toLocaleString()} XP para {siguiente.nombre}
          </Text>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderColor: `${C.amber}30` }]}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
            <Text style={[s.bigNum, { color: C.amber }]}>{userData!.streak_days}</Text>
            <Text style={s.muted}>días racha</Text>
          </View>
          <View style={[s.statCard, { borderColor: `${C.green}30` }]}>
            <Text style={{ fontSize: 22 }}>📊</Text>
            <Text style={[s.bigNum, { color: C.green }]}>{actHoy}</Text>
            <Text style={s.muted}>hoy</Text>
          </View>
        </View>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => router.push("/(tabs)/tracker")}
          activeOpacity={0.85}
        >
          <Text style={s.ctaText}>+ Registrar actividad de hoy</Text>
        </TouchableOpacity>

        {/* ── Actividad reciente ── */}
        <Text style={s.sectionTitle}>Actividad reciente</Text>

        {actividades.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>⚡</Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>Aún no hay actividades</Text>
            <Text style={{ color: "rgba(240,240,236,0.2)", fontSize: 11, marginTop: 4 }}>
              Registra tu primera actividad
            </Text>
          </View>
        ) : (
          actividades.map(act => (
            <View key={act.id} style={s.actItem}>
              <View style={s.actIcon}>
                <Text style={{ fontSize: 18 }}>{CAT_EMOJI[act.category] ?? "⚡"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.actTitle} numberOfLines={1}>{act.title}</Text>
                <Text style={s.muted}>{tiempoDesde(act.created_at)}</Text>
              </View>
              <Text style={{ color: C.green, fontWeight: "700", fontSize: 13 }}>
                +{act.xp_earned} XP
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { fontFamily: "serif", fontSize: 28, fontWeight: "800", color: C.green, letterSpacing: 4 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#1A2B1A", borderWidth: 2, borderColor: C.green,
    justifyContent: "center", alignItems: "center",
  },
  muted: { color: C.muted, fontSize: 12 },
  name: { color: C.text, fontSize: 24, fontWeight: "700", marginTop: 4 },
  username: { fontSize: 13, marginBottom: 20 },
  card: {
    backgroundColor: C.card, borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    padding: 18, marginBottom: 12,
  },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  bigText: { fontSize: 22, fontWeight: "700", marginTop: 2 },
  barBg: { height: 5, borderRadius: 3, backgroundColor: "rgba(99,181,40,0.12)", overflow: "hidden", marginTop: 10 },
  barFill: { height: "100%", borderRadius: 3 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, padding: 16, alignItems: "center", gap: 4,
  },
  bigNum: { fontSize: 30, fontWeight: "800", lineHeight: 36 },
  ctaBtn: {
    backgroundColor: C.green, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginBottom: 24,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: {
    color: C.muted, fontSize: 11, textTransform: "uppercase",
    letterSpacing: 2, marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1,
    borderColor: "rgba(45,90,45,0.2)", padding: 32, alignItems: "center",
  },
  actItem: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(45,90,45,0.2)", padding: 12,
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8,
  },
  actIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(99,181,40,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  actTitle: { color: C.text, fontSize: 13, fontWeight: "600" },
});
