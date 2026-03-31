import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "../components/Screen";
import { ActionButton, GlassCard, Pill, TitleBlock } from "../components/Ui";
import { useAppData } from "../store/AppDataContext";
import { theme } from "../theme/theme";

export function LoginScreen() {
  const { error, sessionDraft, signIn, updateSessionDraft } = useAppData();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <LinearGradient
        colors={["#EAF2FF", "#F8FBFF", "#F3F6FB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Pill label="Phase 1 Live" tone="blue" />
        <TitleBlock
          eyebrow="Backend-connected workspace"
          title="Retail flows now run against your phase 1 API."
          description="Sign in with your backend user, keep the active organization and warehouse in context, and use the mobile shell against the same sales, purchase, party, dashboard, and catalog contracts."
        />
      </LinearGradient>

      <GlassCard style={styles.loginCard}>
        <Text style={styles.cardTitle}>Sign in to retail workspace</Text>
        <View style={styles.form}>
          <TextInput
            value={sessionDraft.username}
            onChangeText={(value) => updateSessionDraft({ username: value })}
            placeholder="Username or email"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={sessionDraft.password}
            onChangeText={(value) => updateSessionDraft({ password: value })}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            secureTextEntry
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={styles.loaderText}>Signing in and loading phase 1 data...</Text>
          </View>
        ) : (
          <ActionButton label="Sign in to workspace" icon="arrow-forward" onPress={handleSignIn} />
        )}
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.lg,
    gap: 18,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    maxWidth: 220,
  },
  heroBadge: {
    alignItems: "center",
    backgroundColor: "#ECFDF3",
    borderRadius: theme.radius.pill,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBadgeText: {
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: "800",
  },
  heroFooter: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
  },
  heroFooterText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  loginCard: {
    gap: 16,
    marginTop: theme.spacing.lg,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  helper: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  form: {
    gap: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: theme.colors.surfaceMuted,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  loaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  loaderText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
});
