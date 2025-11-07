import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function AnalyzingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.title}>Analyzing…</Text>
      <Text style={styles.subtitle}>
        We’ll poll a job here later and navigate to /report when complete.
      </Text>

      {/* Dev-only nav helpers */}
      <View style={{ marginTop: 16 }}>
        <Link href="/upload" style={styles.link}>← Back to Upload</Link>
      </View>
      <View style={{ marginTop: 8 }}>
        <Link href="/report" style={styles.link}>Skip → Report</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  title: { marginTop: 12, fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 13, opacity: 0.7, textAlign: "center" },
  link: { fontSize: 14, textDecorationLine: "underline" }
});
