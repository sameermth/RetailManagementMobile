import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { useAppData } from "../store/AppDataContext";
import { theme } from "../theme/theme";
import { AppModuleKey } from "../types";
import { canAccessModule } from "../utils/access";
import { CustomersScreen } from "./tabs/CustomersScreen";
import { DashboardScreen } from "./tabs/DashboardScreen";
import { FinanceScreen } from "./tabs/FinanceScreen";
import { InventoryScreen } from "./tabs/InventoryScreen";
import { PlatformAdminScreen } from "./tabs/PlatformAdminScreen";
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
  { key: "platform", label: "Platform", icon: "shield-checkmark-outline", description: "Platform control panel for stores and subscriptions" },
];

export function MainShellScreen() {
  const [history, setHistory] = useState<AppModuleKey[]>(["dashboard"]);
  const [moduleDirty, setModuleDirty] = useState(false);
  const [nestedBackHandler, setNestedBackHandler] = useState<(() => boolean) | null>(null);
  const { session } = useAppData();
  const visibleModules = useMemo(() => modules.filter((module) => canAccessModule(session, module.key)), [session]);
  const activeModule = history[history.length - 1] ?? visibleModules[0]?.key ?? "dashboard";

  function confirmDiscard(onConfirm: () => void) {
    const thing =
      activeModule === "sales"
        ? "sales changes"
        : activeModule === "purchases"
          ? "purchase changes"
          : activeModule === "inventory"
            ? "inventory changes"
            : activeModule === "people"
              ? "party changes"
              : activeModule === "finance"
                ? "finance changes"
                : activeModule === "system"
                  ? "system changes"
                  : "changes";
    Alert.alert("Discard changes?", `You have unsaved ${thing} in the current module.`, [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: onConfirm },
    ]);
  }

  function navigateTo(module: AppModuleKey) {
    if (!canAccessModule(session, module)) {
      return;
    }
    if (module === activeModule) {
      return;
    }
    if (moduleDirty) {
      confirmDiscard(() => {
        setModuleDirty(false);
        setHistory((current) => [...current, module]);
      });
      return;
    }
    setHistory((current) => {
      return [...current, module];
    });
  }

  function goBack() {
    if (nestedBackHandler?.()) {
      return;
    }
    if (moduleDirty) {
      confirmDiscard(() => {
        setModuleDirty(false);
        setHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
      });
      return;
    }
    setHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (nestedBackHandler?.()) {
        return true;
      }
      if (history.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [history.length, moduleDirty, activeModule, nestedBackHandler, session]);

  useEffect(() => {
    if (!canAccessModule(session, activeModule)) {
      const fallback = visibleModules[0]?.key ?? "dashboard";
      setModuleDirty(false);
      setHistory([fallback]);
    }
  }, [activeModule, session, visibleModules]);

  const activeItem = visibleModules.find((item) => item.key === activeModule) ?? visibleModules[0] ?? modules[0];
  const content = useMemo(() => {
    switch (activeModule) {
      case "sales":
        return <PosScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "purchases":
        return <PurchasesScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "inventory":
        return <InventoryScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "people":
        return <CustomersScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "finance":
        return <FinanceScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "reports":
        return <ReportsScreen />;
      case "system":
        return <SystemScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "platform":
        return <PlatformAdminScreen onDirtyChange={setModuleDirty} onRegisterBackHandler={setNestedBackHandler} />;
      case "dashboard":
      default:
        return <DashboardScreen onNavigate={navigateTo} />;
    }
  }, [activeModule, session]);

  return (
    <View style={styles.root}>
      <Screen>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.shellEyebrow}>Retail Management</Text>
              <Text style={styles.shellTitle}>{activeItem.label}</Text>
              <Text style={styles.shellDescription}>{activeItem.description}</Text>
            </View>
            {history.length > 1 || nestedBackHandler ? (
              <Pressable onPress={goBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moduleRail}
        >
          {visibleModules.map((module) => {
            const active = module.key === activeModule;
            return (
              <Pressable
                key={module.key}
                onPress={() => navigateTo(module.key)}
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
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerTextWrap: {
    flex: 1,
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
  backButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
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
