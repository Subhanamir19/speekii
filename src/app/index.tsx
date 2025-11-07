import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import useAnalyze from "../hooks/useAnalyze";

export default function HomeScreen() {
  const { analyze, loading, data, error, reset } = useAnalyze({
    dryRun: true, // safe stub mode
  });

  const handlePress = async () => {
    await analyze({ transcript_key: "demo-key" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speakmate ready</Text>
      <Text style={styles.subtitle}>Tap the button to trigger a dry-run analyze()</Text>

      <View style={{ marginTop: 20 }}>
        <Button title={loading ? "Analyzing…" : "Run Dry-Run"} onPress={handlePress} disabled={loading} />
      </View>

      {error && <Text style={styles.error}>⚠️ {error.message}</Text>}
      {data && (
        <Text style={styles.result}>
          ✅ {data.feedback?.vocabulary}
        </Text>
      )}

      {data && !loading && (
        <View style={{ marginTop: 12 }}>
          <Button title="Reset" onPress={reset} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 13, opacity: 0.7, textAlign: "center" },
  error: { marginTop: 20, color: "red", textAlign: "center" },
  result: { marginTop: 20, fontSize: 14, textAlign: "center", color: "green" },
});
