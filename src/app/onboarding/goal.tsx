import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

const OPTIONS = [
  { key: "confidence", label: "Speak with more confidence" },
  { key: "clarity", label: "Improve clarity & structure" },
  { key: "filler", label: "Reduce filler words" },
  { key: "pacing", label: "Fix pacing (too fast/slow)" },
  { key: "ideas", label: "Strengthen idea quality" },
] as const;

export default function OnboardingGoalScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your main goal</Text>
      <Text style={styles.subtitle}>
        Pick the single biggest outcome you want from Speakmate.
      </Text>

      <View style={{ marginTop: 16, width: "100%" }}>
        {OPTIONS.map(opt => {
          const active = selected === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.item, active && styles.itemActive]}
              onPress={() => setSelected(opt.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.itemText, active && styles.itemTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 16 }} />

      {/* Dev-only: carry selection forward via query param.
         Next step will add /onboarding/profile and read it. */}
      <Link
        href={{
          pathname: "/onboarding/profile",
          params: selected ? { goal: selected } : undefined,
        }}
        style={[styles.cta, !selected && styles.ctaDisabled]}
        asChild
      >
        <TouchableOpacity disabled={!selected} activeOpacity={0.8}>
          <Text style={styles.ctaText}>{selected ? "Continue" : "Select one to continue"}</Text>
        </TouchableOpacity>
      </Link>

      <View style={{ marginTop: 12 }}>
        <Link href="/" style={styles.backLink}>Back to Home</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 72 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 13, opacity: 0.7 },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  itemActive: {
    borderColor: "#B4F34D",
    backgroundColor: "rgba(180,243,77,0.08)",
  },
  itemText: { fontSize: 14 },
  itemTextActive: { fontWeight: "600" },
  cta: {
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#B4F34D",
    alignItems: "center",
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: { color: "#000", fontWeight: "700" },
  backLink: { fontSize: 13, textDecorationLine: "underline", opacity: 0.8 },
});
