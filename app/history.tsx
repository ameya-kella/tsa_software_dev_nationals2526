import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getSessionUser } from "../src/utils/session";

type Session = {
  id: string;
  title: string;
  created_at: number;
  last_message?: string;
  last_ts?: number;
};

export default function HistoryScreen() {
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const user = await getSessionUser();
      if (!user) return;

      const username = user.username;

      
      if (!username) return;
      console.log(username);
      const res = await fetch(`http://localhost:8000/sessions/${username}`);
      const data = await res.json();
      // sort newest first
      const sorted = data.sort(
        (a: Session, b: Session) =>
          (b.last_ts || b.created_at) - (a.last_ts || a.created_at)
      );

      setSessions(sorted);

    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = () => {

    setRefreshing(true);
    load();
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const handleRename = async (item: Session) => {
    const newTitle = window.prompt("Enter new conversation title:", item.title);
    if (!newTitle) return;

    try {
      await fetch("http://localhost:8000/rename_session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: item.id, new_title: newTitle }),
      });

      // Update locally so UI reflects change immediately
      setSessions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, title: newTitle } : s))
      );
    } catch (err) {
      console.error("Failed to rename session", err);
    }
  };

  const renderItem = ({ item }: { item: Session }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/speech",
            params: { sessionId: item.id },
          })
        }
      >
        <View style={styles.avatar}>
          <Ionicons name="chatbubble-ellipses" size={18} color="white" />
        </View>
        <View style={{ flex: 1}}>
          <View style={styles.rowBetween}>
            <Text style={styles.titleText} numberOfLines={1}>
              {item.title || "Conversation"}
            </Text>

            <View style={{ alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
              <Text style={styles.time}>
                {formatTime(item.last_ts || item.created_at)}
              </Text>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleRename(item);
                }}
                style={{ marginTop: 4 }}
              >
                <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.preview} numberOfLines={1}>
            {item.last_message || "Tap to open conversation"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />

      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/")}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>History</Text>

          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* LOADING */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="white" />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={40} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>
            Start a chat and your history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050b18" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  emptyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },

  emptySub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 220,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
    maxWidth: "70%",
    lineHeight: 18,
  },

  preview: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: -2,
  },

  time: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
  },
});