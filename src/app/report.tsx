import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report</Text>
      <Text style={styles.subtitle}>
        Results will render here (scores, feedback, actions). This is a placeholder.
      </Text>

      {/* Dev-only nav helpers */}
      <View style={{ marginTop: 16 }}>
        <Link href="/analyzing" style={styles.link}>← Back to Analyzing</Link>
      </View>
      <View style={{ marginTop: 8 }}>
        <Link href="/record" style={styles.link}>Go to Record</Link>
      </View>
      <View style={{ marginTop: 8 }}>
        <Link href="/" style={styles.link}>Home</Link>
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
