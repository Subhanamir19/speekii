import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

const ACCENTS = [
  "American",
  "British",
  "Australian",
  "Indian",
  "Pakistani",
  "Middle Eastern",
  "African",
  "Other",
] as const;

const EXPERIENCE = ["Beginner", "Intermediate", "Advanced"] as const;

type Accent = typeof ACCENTS[number];
type Experience = typeof EXPERIENCE[number];

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { goal } = useLocalSearchParams<{ goal?: string }>();

  const [name, setName] = useState("");
  const [accent, setAccent] = useState<Accent | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);

  const canContinue = useMemo(() => name.trim().length >= 2 && !!accent && !!experience, [name, accent, experience]);

  const handleContinue = () => {
    // Later we’ll persist to a tiny store; for now, just proceed to the first functional screen.
    // If you want to see values later, pass via params:
    // router.push({ pathname: "/record", params: { goal, name, accent: accent!, exp: experience! } });
    router.push("/record");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.container}>
        <Text style={styles.kicker}>Onboarding</Text>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.subtitle}>
          {goal ? `Goal: ${String(goal)}` : "No goal selected"} • Tell us a bit about you.
        </Text>

        {/* Name */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Subhan"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Accent */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Accent</Text>
          <View style={{ marginTop: 8 }}>
            {ACCENTS.map(opt => {
              const active = accent === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setAccent(opt)}
                  style={[styles.pill, active && styles.pillActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Experience */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Experience level</Text>
          <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap" }}>
            {EXPERIENCE.map(opt => {
              const active = experience === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setExperience(opt)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Continue */}
        <View style={{ marginTop: 24 }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canContinue}
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{canContinue ? "Continue" : "Complete the fields to continue"}</Text>
          </TouchableOpacity>
        </View>

        {/* Dev helpers */}
        <View style={{ marginTop: 12 }}>
          <Link href="/onboarding/goal" style={styles.backLink}>← Back to Goal</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 56 },
  kicker: { fontSize: 12, opacity: 0.6, letterSpacing: 0.5 },
  title: { marginTop: 4, fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 13, opacity: 0.7 },

  label: { fontSize: 13, opacity: 0.8 },
  input: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#fff",
  },

  pill: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 8,
  },
  pillActive: {
    borderColor: "#B4F34D",
    backgroundColor: "rgba(180,243,77,0.08)",
  },
  pillText: { fontSize: 14, color: "#fff" },
  pillTextActive: { fontWeight: "600", color: "#B4F34D" },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    borderColor: "#B4F34D",
    backgroundColor: "rgba(180,243,77,0.08)",
  },
  chipText: { fontSize: 13, color: "#fff" },
  chipTextActive: { fontWeight: "600", color: "#B4F34D" },

  cta: {
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#B4F34D",
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#000", fontWeight: "700" },

  backLink: { fontSize: 13, textDecorationLine: "underline", opacity: 0.8 },
});
