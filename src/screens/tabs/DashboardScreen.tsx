import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { GlassCard, GradientCard, MetricCard, Pill, SectionHeader } from "../../components/Ui";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { AppModuleKey } from "../../types";
import { canAccessModule } from "../../utils/access";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";

export function DashboardScreen({
  onNavigate,
}: {
  onNavigate: (tab: AppModuleKey) => void;
}) {
  const { data, error, refreshing, session } = useAppData();
  const summary = data.dashboardSummary;
  const dueSummary = data.dueSummary;

  const quickStats = [
    {
      label: "Today Sales",
      value: formatCompactCurrency(summary?.todaySales?.totalAmount ?? 0),
      delta: `${summary?.todaySales?.totalTransactions ?? 0} transactions`,
      tone: "blue" as const,
    },
    {
      label: "Pending Dues",
      value: formatCompactCurrency(dueSummary?.totalDueAmount ?? 0),
      delta: `${dueSummary?.overdueCount ?? 0} overdue`,
      tone: "orange" as const,
    },
    {
      label: "Low Stock",
      value: `${summary?.lowStockCount ?? data.lowStockAlerts.length}`,
      delta: `${summary?.outOfStockCount ?? 0} out of stock`,
      tone: "green" as const,
    },
  ];

  const shortcuts: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; target: AppModuleKey }[] = [
    { id: "sales", label: "Sales", icon: "flash", target: "sales" as const },
    { id: "purchases", label: "Purchases", icon: "bag", target: "purchases" as const },
    { id: "inventory", label: "Inventory", icon: "cube", target: "inventory" as const },
    { id: "people", label: "People", icon: "people", target: "people" as const },
    { id: "finance", label: "Finance", icon: "wallet", target: "finance" as const },
    { id: "system", label: "System", icon: "settings", target: "system" as const },
    { id: "platform", label: "Platform", icon: "shield-checkmark-outline", target: "platform" as const },
  ];
  const visibleShortcuts = shortcuts.filter((shortcut) => canAccessModule(session, shortcut.target));
  const heroModulesText = canAccessModule(session, "platform")
    ? "Sales, purchases, inventory, people, finance, reports, system, and platform actions are grouped around the same backend modules used by the web app."
    : "Sales, purchases, inventory, people, finance, reports, and system actions are grouped around the same backend modules used by the web app.";

  return (
    <View style={styles.wrap}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Connected workspace</Text>
          <Text style={styles.business}>{session?.organizationName ?? "Retail workspace"}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{session?.username?.slice(0, 2).toUpperCase() ?? "RM"}</Text>
        </View>
      </View>

      <GradientCard colors={["#FFFFFF", "#F8FAFC"]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Workspace Overview</Text>
        <Text style={styles.heroTitle}>The mobile shell now follows the live backend domain flow.</Text>
        <Text style={styles.heroText}>{heroModulesText}</Text>
        <View style={styles.heroPills}>
          <Pill label={`${session?.organizationCode ?? "ORG"} active`} tone="blue" />
          <Pill label={refreshing ? "Refreshing" : "Live API"} tone="green" />
        </View>
      </GradientCard>

      {error ? (
        <GlassCard>
          <Text style={styles.errorText}>{error}</Text>
        </GlassCard>
      ) : null}

      <SectionHeader title="Quick stats" action="Live" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
        {quickStats.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} delta={item.delta} tone={item.tone} />
        ))}
      </ScrollView>

      <SectionHeader title="Quick actions" action="Flow aware" />
      <View style={styles.shortcuts}>
        {visibleShortcuts.map((shortcut) => (
          <Pressable key={shortcut.id} onPress={() => onNavigate(shortcut.target)} style={styles.shortcut}>
            <View style={styles.shortcutIcon}>
              <Ionicons name={shortcut.icon as keyof typeof Ionicons.glyphMap} size={18} color={theme.colors.accent} />
            </View>
            <Text style={styles.shortcutText}>{shortcut.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Top selling products" action={`${data.topProducts.length} tracked`} />
      <View style={styles.list}>
        {data.topProducts.map((product) => (
          <GlassCard key={product.productId} style={styles.listCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.entityTitle}>{product.productName}</Text>
                <Text style={styles.entityMeta}>{product.sku || "No SKU"} • {product.category || "General"}</Text>
              </View>
              <Pill label={`${product.quantitySold ?? 0} sold`} tone="blue" />
            </View>
            <Text style={styles.entityValue}>{formatCurrency(product.totalRevenue ?? 0)}</Text>
          </GlassCard>
        ))}
      </View>

      <SectionHeader title="Upcoming dues" action={`${dueSummary?.totalDueCustomers ?? 0} customers`} />
      <View style={styles.list}>
        {(dueSummary?.upcomingDues ?? []).slice(0, 4).map((due) => (
          <GlassCard key={`${due.customerId}-${due.dueDate}`} style={styles.listCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.entityTitle}>{due.customerName}</Text>
                <Text style={styles.entityMeta}>{due.customerPhone || "No phone"} • {due.dueDate || "Date pending"}</Text>
              </View>
              <Pill label={due.status || "DUE"} tone={due.status === "OVERDUE" ? "orange" : "green"} />
            </View>
            <Text style={styles.entityValue}>{formatCurrency(due.dueAmount ?? 0)}</Text>
          </GlassCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  greeting: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  business: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800", marginTop: 4 },
  avatar: { alignItems: "center", backgroundColor: "#DCEBFF", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  avatarText: { color: theme.colors.accentStrong, fontSize: 14, fontWeight: "800" },
  hero: { gap: 12 },
  heroEyebrow: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" },
  heroTitle: { color: theme.colors.textPrimary, fontSize: 28, lineHeight: 32, fontWeight: "800" },
  heroText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  heroPills: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  horizontal: { marginHorizontal: -theme.spacing.lg, paddingLeft: theme.spacing.lg },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  shortcut: { alignItems: "center", backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md, borderWidth: 1, flexDirection: "row", gap: 10, minWidth: "47%", padding: 16 },
  shortcutIcon: { alignItems: "center", backgroundColor: theme.colors.accentSoft, borderRadius: 14, height: 36, justifyContent: "center", width: 36 },
  shortcutText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700" },
  list: { gap: 12 },
  listCard: { gap: 14 },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  entityTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800", flexShrink: 1 },
  entityMeta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", marginTop: 4 },
  entityValue: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  errorText: { color: "#B42318", fontSize: 13, fontWeight: "700", lineHeight: 18 },
});
