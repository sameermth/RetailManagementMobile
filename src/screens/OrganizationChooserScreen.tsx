import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { ActionButton, GlassCard, Pill, TitleBlock } from "../components/Ui";
import { useAppData } from "../store/AppDataContext";
import { theme } from "../theme/theme";

export function OrganizationChooserScreen() {
  const { session, switchOrganization } = useAppData();
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(session?.organizationId ?? null);
  const [loading, setLoading] = useState(false);

  const memberships = useMemo(
    () => (session?.memberships ?? []).filter((membership) => membership.active),
    [session?.memberships],
  );

  async function handleContinue() {
    if (!selectedOrgId) return;
    setLoading(true);
    try {
      await switchOrganization(selectedOrgId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.wrap}>
        <TitleBlock
          eyebrow="Organization context"
          title="Choose workspace"
          description="Pick the organization you want to use right now. You can switch later from the app."
        />

        <View style={styles.list}>
          {memberships.map((membership) => {
            const selected = selectedOrgId === membership.organizationId;
            return (
              <Pressable
                key={`${membership.userId}-${membership.organizationId}`}
                style={[styles.cardPressable, selected && styles.cardPressableActive]}
                onPress={() => setSelectedOrgId(membership.organizationId)}
              >
                <GlassCard style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.orgName}>{membership.organizationName}</Text>
                    <Pill label={membership.roleCode || "MEMBER"} tone={selected ? "blue" : "green"} />
                  </View>
                  <Text style={styles.orgMeta}>{membership.organizationCode}</Text>
                  <Text style={styles.orgMeta}>Default branch: {membership.defaultBranchId ?? "-"}</Text>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>

        <ActionButton
          label={loading ? "Switching..." : "Continue"}
          icon="arrow-forward"
          onPress={loading || !selectedOrgId ? undefined : handleContinue}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  list: { gap: 10 },
  cardPressable: { borderRadius: theme.radius.md },
  cardPressableActive: {
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  card: { gap: 6 },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
  orgName: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800", flex: 1 },
  orgMeta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600" },
});

