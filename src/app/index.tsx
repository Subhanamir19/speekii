import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speakmate ready</Text>
      <Text style={styles.subtitle}>Expo SDK 54 • Router online</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600" },
  subtitle: { marginTop: 6, fontSize: 12, opacity: 0.7 }
});
