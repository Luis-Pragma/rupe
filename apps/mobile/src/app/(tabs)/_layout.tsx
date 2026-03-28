import { Tabs } from "expo-router";
import { View, Text } from "react-native";

const C = {
  bg: "#0D1117",
  border: "rgba(45,90,45,0.4)",
  green: "#63B528",
  muted: "rgba(240,240,236,0.3)",
};

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 9, color: focused ? C.green : C.muted, letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Inicio" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" label="Tracker" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="comunidades"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Comunidad" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
