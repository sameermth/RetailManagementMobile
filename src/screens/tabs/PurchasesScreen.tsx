import React from "react";

import { useAppData } from "../../store/AppDataContext";
import { hasAnyPermission } from "../../utils/access";
import { SettingsScreen } from "./SettingsScreen";

export function PurchasesScreen({
  onDirtyChange,
  onRegisterBackHandler,
}: {
  onDirtyChange?: (dirty: boolean) => void;
  onRegisterBackHandler?: (handler: (() => boolean) | null) => void;
}) {
  const { session } = useAppData();
  const canPurchases = hasAnyPermission(session, ["purchases.view", "purchases.create", "purchases.receive"]);
  const canReturns = hasAnyPermission(session, ["sales.return", "purchases.view"]);
  const allowedViews = [
    ...(canPurchases ? (["purchases"] as const) : []),
    ...(canReturns ? (["returns"] as const) : []),
  ];

  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      onRegisterBackHandler={onRegisterBackHandler}
      initialView={allowedViews.includes("purchases") ? "purchases" : allowedViews[0] ?? "purchases"}
      allowedViews={allowedViews}
      title="Purchases"
      subtitle="Purchase orders, receipts, supplier payments, and return flows mapped to the current backend purchase modules."
    />
  );
}
