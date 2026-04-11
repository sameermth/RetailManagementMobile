import React from "react";
import { StyleSheet, Text } from "react-native";

import { GlassCard } from "../../components/Ui";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { hasPlatformAdminAccess } from "../../utils/access";
import { SettingsScreen } from "./SettingsScreen";

export function PlatformAdminScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { session } = useAppData();
  const showPlatformModule = hasPlatformAdminAccess(session);

  if (!showPlatformModule) {
    return (
      <GlassCard style={styles.guardCard}>
        <Text style={styles.guardTitle}>Access restricted</Text>
        <Text style={styles.guardText}>
          Platform Admin is available only for platform administrators. Switch to an authorized account to continue.
        </Text>
      </GlassCard>
    );
  }

  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="platform"
      allowedViews={["platform"]}
      title="Platform Admin"
      subtitle="Tenant operations, templates, schedules, notifications, and platform tooling aligned to the web admin console."
    />
  );
}

const styles = StyleSheet.create({
  guardCard: { gap: 12 },
  guardTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  guardText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600" },
});
