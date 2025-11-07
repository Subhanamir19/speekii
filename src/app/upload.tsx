import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function UploadScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload</Text>
      <Text style={styles.subtitle}>
        Placeholder for picking a recording and sending it to the backend. UI comes later.
      </Text>

      {/* Dev-only nav helpers: remove after wiring real flow */}
      <View style={{ marginTop: 16 }}>
        <Link href="/record" style={styles.link}>← Back to Record</Link>
      </View>
      <View style={{ marginTop: 8 }}>
        <Link href="/analyzing" style={styles.link}>Continue → Analyzing</Link>
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
