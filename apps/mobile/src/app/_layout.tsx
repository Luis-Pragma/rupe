import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useRouter, useSegments } from "expo-router";
import type { Session } from "@supabase/supabase-js";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return; // Cargando

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // No autenticado → ir al login
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Autenticado → ir al dashboard
      router.replace("/(tabs)/dashboard");
    }
  }, [session, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
