import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { ActionButton, ActionSheet, BackButton } from "../components/Ui";
import { theme } from "../theme/theme";
import { AppModuleKey } from "../types";
import { AccountantScreen } from "./tabs/AccountantScreen";
import { BankingScreen } from "./tabs/BankingScreen";
import { CustomersScreen } from "./tabs/CustomersScreen";
import { DashboardScreen } from "./tabs/DashboardScreen";
import { DocumentsScreen } from "./tabs/DocumentsScreen";
import { FinanceScreen } from "./tabs/FinanceScreen";
import { InventoryScreen } from "./tabs/InventoryScreen";
import { PlatformAdminScreen } from "./tabs/PlatformAdminScreen";
import { PosScreen } from "./tabs/PosScreen";
import { PurchasesScreen } from "./tabs/PurchasesScreen";
import { ReportsScreen } from "./tabs/ReportsScreen";
import { SystemScreen } from "./tabs/SystemScreen";
import { useAppData } from "../store/AppDataContext";
import { hasPlatformAdminAccess } from "../utils/access";

const moduleCatalog: { key: AppModuleKey; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline", description: "Live overview and backend shortcuts" },
  { key: "sales", label: "Sales", icon: "receipt-outline", description: "Quotes, orders, invoices, receipts" },
  { key: "purchases", label: "Purchases", icon: "bag-handle-outline", description: "Orders, receipts, payments" },
  { key: "inventory", label: "Inventory", icon: "cube-outline", description: "Catalog, stock, transfers" },
  { key: "people", label: "People", icon: "people-outline", description: "Customers, suppliers, terms" },
  { key: "banking", label: "Banking", icon: "card-outline", description: "Accounts, statements, reconciliation" },
  { key: "accountant", label: "Accountant", icon: "book-outline", description: "Chart of accounts and journals" },
  { key: "finance", label: "Finance", icon: "wallet-outline", description: "Accounts, expenses, banking" },
  { key: "reports", label: "Reports", icon: "bar-chart-outline", description: "Business, GST, approvals" },
  { key: "documents", label: "Documents", icon: "folder-open-outline", description: "File center and document context" },
  { key: "system", label: "System", icon: "settings-outline", description: "Organization, staff, tooling" },
  { key: "platform", label: "Platform", icon: "shield-checkmark-outline", description: "Admin console and operations" },
  { key: "more", label: "More", icon: "ellipsis-horizontal-outline", description: "Other tools and settings" },
];

const navModules: AppModuleKey[] = ["dashboard", "sales", "purchases", "more"];
const moreModules: AppModuleKey[] = ["inventory", "people", "banking", "accountant", "finance", "reports", "documents", "system", "platform"];

  const quickActions = [
  { key: "sales", label: "New sale", icon: "flash-outline" as const, target: "sales" as const },
  { key: "purchases", label: "Purchase", icon: "cart-outline" as const, target: "purchases" as const },
  { key: "people", label: "Customer", icon: "person-add-outline" as const, target: "people" as const },
  { key: "banking", label: "Banking", icon: "card-outline" as const, target: "banking" as const },
];

export function MainShellScreen() {
  const [history, setHistory] = useState<AppModuleKey[]>(["dashboard"]);
  const [moduleDirty, setModuleDirty] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { refreshAll, refreshing, session, signOut } = useAppData();
  const showPlatformModule = hasPlatformAdminAccess(session);

  const activeModule = history[history.length - 1] ?? "dashboard";
  const visibleModules = useMemo(
    () => moduleCatalog.filter((module) => module.key !== "platform" || showPlatformModule),
    [showPlatformModule],
  );
  const visibleMoreModules = useMemo(
    () => moreModules.filter((moduleKey) => moduleKey !== "platform" || showPlatformModule),
    [showPlatformModule],
  );

  const activeItem = visibleModules.find((item) => item.key === activeModule) ?? visibleModules[0];
  const activeBottomKey = navModules.includes(activeModule) ? activeModule : "more";
  const bottomNavItems = visibleModules.filter((item) => navModules.includes(item.key));

  const MoreScreen = ({ onOpenModule }: { onOpenModule: (module: AppModuleKey) => void }) => (
    <View style={styles.moreContainer}>
      <Text style={styles.moreTitle}>More tools</Text>
      <Text style={styles.moreDescription}>Access the rest of the application from one place.</Text>
      <View style={styles.moreGrid}>
        {visibleMoreModules.map((key) => {
          const item = visibleModules.find((entry) => entry.key === key)!;
          return (
            <Pressable key={key} style={styles.moreCard} onPress={() => onOpenModule(key)}>
              <Ionicons name={item.icon} size={20} color={theme.colors.accent} />
              <Text style={styles.moreCardLabel}>{item.label}</Text>
              <Text style={styles.moreCardDescription}>{item.description}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.moreFooter}>
        <ActionButton label="Sign out" icon="log-out-outline" inverted onPress={confirmSignOut} />
      </View>
    </View>
  );

  const confirmDiscard = useCallback(
    (onConfirm: () => void) => {
      const thing =
        activeModule === "sales"
          ? "sales changes"
          : activeModule === "purchases"
          ? "purchase changes"
          : activeModule === "inventory"
          ? "inventory changes"
        : activeModule === "people"
          ? "party changes"
          : activeModule === "banking"
          ? "banking changes"
          : activeModule === "accountant"
          ? "accounting changes"
          : activeModule === "finance"
          ? "finance changes"
          : activeModule === "documents"
          ? "document changes"
          : activeModule === "system"
          ? "system changes"
          : activeModule === "platform"
          ? "platform changes"
          : "changes";
      Alert.alert("Discard changes?", `You have unsaved ${thing} in the current module.`, [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: onConfirm },
      ]);
    },
    [activeModule],
  );

  const navigateTo = useCallback(
    (module: AppModuleKey) => {
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
      setHistory((current) => [...current, module]);
    },
    [activeModule, moduleDirty, confirmDiscard],
  );

  const goBack = useCallback(() => {
    if (moduleDirty) {
      confirmDiscard(() => {
        setModuleDirty(false);
        setHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
      });
      return;
    }
    setHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }, [moduleDirty, confirmDiscard]);

  const confirmSignOut = useCallback(() => {
    Alert.alert("Sign out?", "You will need to sign in again to continue.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);
  }, [signOut]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (history.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [history.length, goBack]);

  useEffect(() => {
    if (!showPlatformModule && activeModule === "platform") {
      setModuleDirty(false);
      setHistory((current) => [...current.filter((entry) => entry !== "platform"), "dashboard"]);
    }
  }, [activeModule, showPlatformModule]);

  const content = useMemo(() => {
    switch (activeModule) {
      case "sales":
        return <PosScreen onDirtyChange={setModuleDirty} />;
      case "purchases":
        return <PurchasesScreen onDirtyChange={setModuleDirty} />;
      case "inventory":
        return <InventoryScreen onDirtyChange={setModuleDirty} />;
      case "people":
        return <CustomersScreen onDirtyChange={setModuleDirty} />;
      case "finance":
        return <FinanceScreen onDirtyChange={setModuleDirty} />;
      case "banking":
        return <BankingScreen onDirtyChange={setModuleDirty} />;
      case "accountant":
        return <AccountantScreen onDirtyChange={setModuleDirty} />;
      case "reports":
        return <ReportsScreen />;
      case "documents":
        return <DocumentsScreen />;
      case "system":
        return <SystemScreen onDirtyChange={setModuleDirty} />;
      case "platform":
        return showPlatformModule ? <PlatformAdminScreen onDirtyChange={setModuleDirty} /> : <DashboardScreen onNavigate={navigateTo} />;
      case "more":
        return <MoreScreen onOpenModule={navigateTo} />;
      case "dashboard":
      default:
        return <DashboardScreen onNavigate={navigateTo} />;
    }
  }, [activeModule, navigateTo, showPlatformModule]);

  return (
    <View style={styles.root}>
      <Screen scroll={false} padded={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              {history.length > 1 ? <BackButton label="Previous" onPress={goBack} /> : null}
              <Text style={styles.shellEyebrow}>Retail Management</Text>
              <Text style={styles.shellTitle}>{activeItem.label}</Text>
              <Text style={styles.shellDescription}>{activeItem.description}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={refreshAll} style={styles.refreshButton}>
                <Ionicons name={refreshing ? "refresh-circle" : "refresh-outline"} size={20} color={theme.colors.accent} />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        </View>
      </Screen>

      <View style={styles.bottomNav}>
        {bottomNavItems.map((module) => {
          const active = module.key === activeBottomKey;
          return (
            <Pressable
              key={module.key}
              onPress={() => navigateTo(module.key)}
              style={styles.navItem}
            >
              <Ionicons
                name={module.icon}
                size={22}
                color={active ? theme.colors.accent : theme.colors.textSecondary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{module.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.quickActionShell}>
        <ActionButton
          label="Quick actions"
          icon="flash"
          inverted
          onPress={() => setShowQuickActions(true)}
        />
      </View>

      <ActionSheet
        label="Quick actions"
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        actions={quickActions.map((action) => ({
          id: action.key,
          label: action.label,
          icon: action.icon,
          description: `Open the ${action.label.toLowerCase()} module.`,
          onPress: () => navigateTo(action.target),
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 6,
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
    marginTop: 4,
  },
  shellDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 6,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  mainContent: {
    gap: theme.spacing.lg,
    paddingBottom: 32,
  },
  bottomNav: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  navLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  navLabelActive: {
    color: theme.colors.accent,
  },
  quickActionShell: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: 76,
    alignItems: "flex-end",
  },
  quickActionPanel: {
    marginTop: theme.spacing.sm,
    alignItems: "flex-end",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  quickActionButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  quickActionText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  moreContainer: {
    gap: theme.spacing.md,
  },
  moreTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  moreDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  moreGrid: {
    gap: theme.spacing.md,
  },
  moreFooter: {
    marginTop: theme.spacing.sm,
    alignItems: "flex-start",
  },
  moreCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  moreCardLabel: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  moreCardDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
