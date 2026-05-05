import { View, Platform, StyleSheet } from "react-native";
import { Stack, Slot } from "expo-router";
import { useState, useEffect } from "react";
import { aslSocket } from "../src/ws/aslSocket";
import { getSessionUser } from "../src/utils/session";
import { useRootNavigationState, useRouter } from "expo-router";

export default function Layout() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!rootNavigationState?.key) return;

      const sessionUser = await getSessionUser();

      if (!mounted) return;

      if (!sessionUser) {
        router.replace("/login");
        return;
      }

      setUser(sessionUser);
      if (!aslSocket.isConnected()) {
        setTimeout(() => {
          aslSocket.connect()
        }, 50);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [rootNavigationState?.key]);

  return (
    <View style={styles.wrapper}>
      {Platform.OS === "web" ? (
        <View style={styles.phoneFrame}>
          <Slot />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#0b1220" },
  phoneFrame: {
    width: 440,
    height: 800,
    marginLeft: "auto",
    marginRight: "auto",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
});
