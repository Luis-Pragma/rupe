import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const COLORS = {
  green: "#63B528",
  deep: "#3B6D11",
  dark: "#1A2B1A",
  light: "#EAF3DE",
  bone: "#F0F0EC",
  amber: "#EF9F27",
};

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/(auth)/login");
        return;
      }
      setUser(user);
    });
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RUPE</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOut}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Bienvenida */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeLabel}>Bienvenido de vuelta</Text>
        <Text style={styles.welcomeName}>
          {user.user_metadata?.full_name ?? user.email}
        </Text>
      </View>

      {/* Métricas */}
      <View style={styles.metricsRow}>
        {[
          { label: "XP Total", value: "—" },
          { label: "Racha", value: "—" },
          { label: "Nivel", value: "—" },
        ].map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.placeholder}>Dashboard en construcción — RUPE MVP</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bone },
  content: { padding: 20, paddingTop: 56 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.green,
  },
  signOut: { fontSize: 14, color: "#888" },
  welcomeCard: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcomeLabel: { fontSize: 12, color: COLORS.deep, fontWeight: "500", marginBottom: 4 },
  welcomeName: { fontSize: 22, fontWeight: "600", color: COLORS.dark },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  metricCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: { fontSize: 10, color: "#999", textTransform: "uppercase", marginBottom: 6 },
  metricValue: { fontSize: 24, fontWeight: "bold", color: COLORS.green },
  placeholder: { textAlign: "center", color: "#bbb", fontSize: 13, marginTop: 20 },
});
