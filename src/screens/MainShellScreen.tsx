import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { theme } from "../theme/theme";
import { AppModuleKey } from "../types";
import { CustomersScreen } from "./tabs/CustomersScreen";
import { DashboardScreen } from "./tabs/DashboardScreen";
import { FinanceScreen } from "./tabs/FinanceScreen";
import { InventoryScreen } from "./tabs/InventoryScreen";
import { PosScreen } from "./tabs/PosScreen";
import { PurchasesScreen } from "./tabs/PurchasesScreen";
import { ReportsScreen } from "./tabs/ReportsScreen";
import { SystemScreen } from "./tabs/SystemScreen";

const modules: { key: AppModuleKey; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline", description: "Live overview and backend shortcuts" },
  { key: "sales", label: "Sales", icon: "receipt-outline", description: "Quotes, orders, invoices, and receipts" },
  { key: "purchases", label: "Purchases", icon: "bag-handle-outline", description: "Orders, receipts, payments, and returns" },
  { key: "inventory", label: "Inventory", icon: "cube-outline", description: "Catalog, stock, transfers, and tracking" },
  { key: "people", label: "People", icon: "people-outline", description: "Customers, suppliers, terms, and catalogs" },
  { key: "finance", label: "Finance", icon: "wallet-outline", description: "Accounts, vouchers, expenses, and bank rec" },
  { key: "reports", label: "Reports", icon: "bar-chart-outline", description: "Business, GST, approvals, and workflow" },
  { key: "system", label: "System", icon: "settings-outline", description: "Organization, branches, employees, and tooling" },
];

export function MainShellScreen() {
  const [activeModule, setActiveModule] = useState<AppModuleKey>("dashboard");

  const activeItem = modules.find((item) => item.key === activeModule) ?? modules[0];
  const content = useMemo(() => {
    switch (activeModule) {
      case "sales":
        return <PosScreen />;
      case "purchases":
        return <PurchasesScreen />;
      case "inventory":
        return <InventoryScreen />;
      case "people":
        return <CustomersScreen />;
      case "finance":
        return <FinanceScreen />;
      case "reports":
        return <ReportsScreen />;
      case "system":
        return <SystemScreen />;
      case "dashboard":
      default:
        return <DashboardScreen onNavigate={setActiveModule} />;
    }
  }, [activeModule]);

  return (
    <View style={styles.root}>
      <Screen>
        <View style={styles.header}>
          <Text style={styles.shellEyebrow}>Retail Management</Text>
          <Text style={styles.shellTitle}>{activeItem.label}</Text>
          <Text style={styles.shellDescription}>{activeItem.description}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moduleRail}
        >
          {modules.map((module) => {
            const active = module.key === activeModule;
            return (
              <Pressable
                key={module.key}
                onPress={() => setActiveModule(module.key)}
                style={[styles.moduleChip, active && styles.moduleChipActive]}
              >
                <Ionicons
                  name={module.icon}
                  size={18}
                  color={active ? "#FFFFFF" : theme.colors.textSecondary}
                />
                <Text style={[styles.moduleChipText, active && styles.moduleChipTextActive]}>
                  {module.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {content}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  shellEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  shellTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  shellDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  moduleRail: {
    gap: 10,
    paddingBottom: theme.spacing.lg,
  },
  moduleChip: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  moduleChipActive: {
    backgroundColor: theme.colors.accent,
  },
  moduleChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  moduleChipTextActive: {
    color: "#FFFFFF",
  },
});
