import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function RecordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record</Text>
      <Text style={styles.subtitle}>This is the capture entry point. UI comes later.</Text>

      {/* Dev-only nav helper: remove once the flow is wired */}
      <View style={{ marginTop: 16 }}>
        <Link href="/" style={styles.link}>Back to Home</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 13, opacity: 0.7, textAlign: "center" },
  link: { fontSize: 14, textDecorationLine: "underline" }
});
