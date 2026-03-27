import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

const COLORS = {
  green: "#63B528",
  deep: "#3B6D11",
  dark: "#1A2B1A",
  light: "#EAF3DE",
  bone: "#F0F0EC",
  error: "#DC2626",
};

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setError(traducirError(error.message));
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={[styles.container, { justifyContent: "center", padding: 24 }]}>
        <Text style={[styles.logo, { marginBottom: 8 }]}>✓</Text>
        <Text style={[styles.title, { textAlign: "center" }]}>
          ¡Revisa tu correo!
        </Text>
        <Text style={[styles.footer, { marginTop: 8 }]}>
          Enviamos un link de confirmación a {email}.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={[styles.button, { marginTop: 24 }]}
        >
          <Text style={styles.buttonText}>Ir al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>RUPE</Text>
        <Text style={styles.tagline}>Tu progreso, tu identidad.</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Crea tu cuenta</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre"
              placeholderTextColor="#999"
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña (mínimo 8 caracteres)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta gratis</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/(auth)/login" style={styles.link}>
            Inicia sesión
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bone },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: {
    fontFamily: "serif",
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.green,
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "600", color: COLORS.dark, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.dark,
    backgroundColor: COLORS.bone,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: COLORS.error, fontSize: 13 },
  button: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { textAlign: "center", color: "#888", fontSize: 14, marginTop: 24 },
  link: { color: COLORS.green, fontWeight: "600" },
});

function traducirError(message: string): string {
  if (message.includes("User already registered"))
    return "Ya existe una cuenta con ese correo.";
  if (message.includes("Password should be at least"))
    return "La contraseña debe tener al menos 8 caracteres.";
  return "No se pudo crear la cuenta. Intenta de nuevo.";
}
