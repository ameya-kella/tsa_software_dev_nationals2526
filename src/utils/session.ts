import AsyncStorage from "@react-native-async-storage/async-storage";

export const setSessionUser = async (username: string) => {
  await AsyncStorage.setItem("user", JSON.stringify({ username }));
};

export const getSessionUser = async () => {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = async () => {
  await AsyncStorage.removeItem("user");
};