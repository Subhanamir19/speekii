import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface CaptureButtonProps {
  /** Called when a press starts (useful for press-and-hold semantics). */
  onStart?: () => void;
  /** Called when a press ends (release). */
  onStop?: () => void;
  /** Called on a quick tap (toggle-style capture). */
  onTap?: () => void;
  /** Visual state flags */
  recording?: boolean;
  disabled?: boolean;
  /** Optional label under the button */
  label?: string;
}

/**
 * Pure UI capture control.
 * - No media dependencies.
 * - Emits onStart/onStop/onTap so the screen can choose press-to-record vs tap-to-toggle.
 * - Designed to be composable: wire to Expo-AV in a later step.
 */
export default function CaptureButton({
  onStart,
  onStop,
  onTap,
  recording = false,
  disabled = false,
  label,
}: CaptureButtonProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel="Capture"
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={() => onStart?.()}
        onPressOut={() => onStop?.()}
        onPress={() => onTap?.()}
        style={({ pressed }) => [
          styles.button,
          recording && styles.recording,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <View style={[styles.inner, recording && styles.innerRecording]} />
      </Pressable>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const SIZE = 86;
const INNER = 64;

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F1F1F",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)",
  },
  inner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    backgroundColor: "#B4F34D",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  recording: {
    borderColor: "#B4F34D",
    backgroundColor: "rgba(180,243,77,0.10)",
  },
  innerRecording: {
    backgroundColor: "#FF3B30",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
});
