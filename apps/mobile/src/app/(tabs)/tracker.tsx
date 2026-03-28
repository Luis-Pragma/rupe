import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from "react-native";
import { supabase } from "@/lib/supabase";

const C = {
  bg: "#0D1117", card: "#0F1A0F", green: "#63B528",
  amber: "#EF9F27", purple: "#7F77DD",
  text: "#F0F0EC", muted: "rgba(240,240,236,0.4)",
  border: "rgba(45,90,45,0.3)",
};

const CATEGORIAS = [
  { id: "content",  label: "Contenido",   emoji: "🎬", color: "#63B528" },
  { id: "finance",  label: "Finanzas",    emoji: "💰", color: "#EF9F27" },
  { id: "learning", label: "Aprendizaje", emoji: "📚", color: "#7F77DD" },
  { id: "social",   label: "Social",      emoji: "🤝", color: "#38BDF8" },
  { id: "health",   label: "Salud",       emoji: "⚡", color: "#F87171" },
];

function getTechoDiario(nivel: number): number {
  if (nivel <= 3) return 300;
  if (nivel <= 6) return 200;
  if (nivel <= 8) return 150;
  return 100;
}

function getNivelDesdeXP(xp: number): number {
  if (xp >= 40000) return 10;
  if (xp >= 27000) return 9;
  if (xp >= 18000) return 8;
  if (xp >= 12000) return 7;
  if (xp >= 7500)  return 6;
  if (xp >= 4500)  return 5;
  if (xp >= 2500)  return 4;
  if (xp >= 1200)  return 3;
  if (xp >= 500)   return 2;
  return 1;
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

export default function TrackerScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [xpHoy, setXpHoy] = useState(0);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prueba, setPrueba] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const hoy = new Date().toISOString().split("T")[0];
    const [{ data: ud }, { data: acts }, { data: actsHoy }] = await Promise.all([
      supabase.from("users").select("level, xp, streak_days, updated_at").eq("id", user.id).single(),
      supabase.from("activities").select("id, title, category, xp_earned, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("activities").select("xp_earned").eq("user_id", user.id).gte("created_at", `${hoy}T00:00:00.000Z`),
    ]);

    if (ud) {
      setLevel(ud.level ?? 1);
      setXp(ud.xp ?? 0);
      setStreakDays(ud.streak_days ?? 0);
      setUpdatedAt(ud.updated_at);
    }
    setActividades(acts ?? []);
    setXpHoy((actsHoy ?? []).reduce((s: number, a: { xp_earned: number }) => s + (a.xp_earned ?? 0), 0));
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function registrar() {
    if (!titulo.trim() || !categoria) {
      Alert.alert("Campos requeridos", "Ingresa un título y selecciona una categoría.");
      return;
    }
    if (!userId) return;
    setEnviando(true);

    const techo = getTechoDiario(level);
    const xpDisponible = Math.max(0, techo - xpHoy);
    let xpActividad = 50;
    if (prueba.trim()) xpActividad += 20;
    const xpFinal = Math.min(xpActividad, xpDisponible);

    // Insertar actividad
    const { error: actErr } = await supabase.from("activities").insert({
      user_id: userId,
      type: categoria,
      title: titulo.trim(),
      description: descripcion.trim() || null,
      xp_earned: xpFinal,
      category: categoria,
      date: new Date().toISOString(),
    });

    if (actErr) {
      Alert.alert("Error", "No se pudo registrar. Verifica tu conexión.");
      setEnviando(false);
      return;
    }

    // Calcular racha
    const hoy = new Date().toISOString().split("T")[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const ultimaFecha = updatedAt ? updatedAt.split("T")[0] : null;
    const eraAyer = ultimaFecha === ayer;
    const eraHoy = ultimaFecha === hoy;
    let nuevaRacha = streakDays;
    if (!eraHoy) nuevaRacha = eraAyer ? streakDays + 1 : 1;

    const nuevoXP = xp + xpFinal;
    const nuevoNivel = getNivelDesdeXP(nuevoXP);

    await supabase.from("users").update({
      xp: nuevoXP, level: nuevoNivel,
      streak_days: nuevaRacha, updated_at: new Date().toISOString(),
    }).eq("id", userId);

    // Actualizar estado local
    setXp(nuevoXP);
    setLevel(nuevoNivel);
    setStreakDays(nuevaRacha);
    setXpHoy(prev => Math.min(techo, prev + xpFinal));
    setActividades(prev => [{
      id: Date.now().toString(), title: titulo.trim(),
      category: categoria, xp_earned: xpFinal,
      created_at: new Date().toISOString(),
    }, ...prev]);

    if (nuevoNivel > level) {
      Alert.alert("🎉 ¡Subiste de nivel!", `Ahora eres nivel ${nuevoNivel}`);
    } else {
      Alert.alert("✅ Actividad registrada", `+${xpFinal} XP${xpFinal < xpActividad ? " (techo alcanzado)" : ""}`);
    }

    setTitulo(""); setDescripcion(""); setPrueba(""); setCategoria("");
    setMostrarForm(false);
    setEnviando(false);
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.green} size="large" />
      </View>
    );
  }

  const techo = getTechoDiario(level);
  const progresoPct = Math.min(100, (xpHoy / techo) * 100);
  const catInfo = CATEGORIAS.find(c => c.id === categoria);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── Header ── */}
          <Text style={s.pageTitle}>Tracker ⚡</Text>
          <Text style={s.pageSub}>Registra lo que hiciste hoy</Text>

          {/* ── XP de hoy ── */}
          <View style={s.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: C.muted, fontSize: 12 }}>XP de hoy</Text>
              <Text style={{ color: C.green, fontWeight: "700", fontSize: 12 }}>
                {xpHoy} / {techo}
              </Text>
            </View>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${progresoPct}%` as `${number}%` }]} />
            </View>
            {xpHoy >= techo && (
              <Text style={{ color: C.amber, fontSize: 11, marginTop: 6, textAlign: "center" }}>
                🎯 Techo diario alcanzado — vuelve mañana
              </Text>
            )}
          </View>

          {/* ── Botón / Formulario ── */}
          {!mostrarForm ? (
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => setMostrarForm(true)}
              activeOpacity={0.85}
              disabled={xpHoy >= techo}
            >
              <Text style={s.ctaText}>+ Registrar actividad</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.card}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 15, marginBottom: 14 }}>
                Nueva actividad
              </Text>

              {/* Categorías */}
              <Text style={s.fieldLabel}>Categoría</Text>
              <View style={s.catRow}>
                {CATEGORIAS.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoria(cat.id)}
                    style={[s.catBtn, categoria === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}18` }]}
                  >
                    <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                    <Text style={[s.catLabel, categoria === cat.id && { color: cat.color }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Título */}
              <Text style={[s.fieldLabel, { marginTop: 14 }]}>¿Qué hiciste?</Text>
              <TextInput
                style={s.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="ej. Grabé un video de YouTube..."
                placeholderTextColor="rgba(240,240,236,0.25)"
              />

              {/* Descripción */}
              <Text style={[s.fieldLabel, { marginTop: 10 }]}>Descripción (opcional)</Text>
              <TextInput
                style={[s.input, { height: 72, textAlignVertical: "top", paddingTop: 10 }]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Más detalles..."
                placeholderTextColor="rgba(240,240,236,0.25)"
                multiline
              />

              {/* Prueba */}
              <Text style={[s.fieldLabel, { marginTop: 10 }]}>Prueba / Enlace (+20 XP)</Text>
              <TextInput
                style={s.input}
                value={prueba}
                onChangeText={setPrueba}
                placeholder="https://..."
                placeholderTextColor="rgba(240,240,236,0.25)"
                autoCapitalize="none"
                keyboardType="url"
              />

              {/* XP preview */}
              {catInfo && titulo.trim() && (
                <View style={s.xpPreview}>
                  <Text style={{ color: C.green, fontWeight: "700" }}>
                    +{Math.min(prueba.trim() ? 70 : 50, techo - xpHoy)} XP
                  </Text>
                  {prueba.trim() && <Text style={{ color: C.muted, fontSize: 11 }}>(incluye +20 por prueba)</Text>}
                </View>
              )}

              {/* Botones */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[s.btn, { flex: 1, backgroundColor: "rgba(45,90,45,0.2)", borderColor: C.border }]}
                  onPress={() => { setMostrarForm(false); setCategoria(""); setTitulo(""); }}
                >
                  <Text style={{ color: C.muted, fontWeight: "600" }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btn, { flex: 2, backgroundColor: C.green }]}
                  onPress={registrar}
                  disabled={enviando || !titulo.trim() || !categoria}
                >
                  {enviando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={{ color: "#fff", fontWeight: "700" }}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Historial ── */}
          <Text style={s.sectionTitle}>Historial</Text>
          {actividades.length === 0 ? (
            <Text style={{ color: C.muted, textAlign: "center", marginTop: 16 }}>
              Sin actividades aún
            </Text>
          ) : (
            actividades.map(act => (
              <View key={act.id} style={s.actItem}>
                <View style={s.actIcon}>
                  <Text style={{ fontSize: 18 }}>
                    {CATEGORIAS.find(c => c.id === act.category)?.emoji ?? "⚡"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }} numberOfLines={1}>
                    {act.title}
                  </Text>
                  <Text style={s.muted}>{tiempoDesde(act.created_at)}</Text>
                </View>
                <Text style={{ color: C.green, fontWeight: "700", fontSize: 13 }}>
                  +{act.xp_earned} XP
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { color: C.text, fontSize: 24, fontWeight: "800", marginBottom: 4 },
  pageSub: { color: C.muted, fontSize: 13, marginBottom: 20 },
  card: {
    backgroundColor: C.card, borderRadius: 18,
    borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 14,
  },
  barBg: { height: 6, borderRadius: 3, backgroundColor: "rgba(99,181,40,0.1)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3, backgroundColor: C.green },
  ctaBtn: {
    backgroundColor: C.green, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginBottom: 24,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  fieldLabel: { color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: "500" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catBtn: {
    borderWidth: 1, borderColor: C.border, borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 12,
    alignItems: "center", gap: 4, minWidth: 72,
  },
  catLabel: { color: C.muted, fontSize: 10, fontWeight: "600" },
  input: {
    backgroundColor: "#1a2e1a", borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: C.text, fontSize: 14,
  },
  xpPreview: {
    backgroundColor: "rgba(99,181,40,0.08)", borderRadius: 10,
    padding: 10, marginTop: 10, alignItems: "center", gap: 2,
  },
  btn: {
    paddingVertical: 14, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: {
    color: C.muted, fontSize: 11, textTransform: "uppercase",
    letterSpacing: 2, marginTop: 8, marginBottom: 12,
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
  muted: { color: C.muted, fontSize: 12 },
});
