import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function PurchasesScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="purchases"
      allowedViews={["purchases", "returns"]}
      title="Purchases"
      subtitle="Purchase orders, receipts, supplier payments, and return flows mapped to the current backend purchase modules."
    />
  );
}
