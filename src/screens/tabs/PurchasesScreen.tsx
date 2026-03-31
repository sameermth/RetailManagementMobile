import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function PurchasesScreen() {
  return (
    <SettingsScreen
      initialView="purchases"
      allowedViews={["purchases", "returns"]}
      title="Purchases"
      subtitle="Purchase orders, receipts, supplier payments, and return flows mapped to the current backend purchase modules."
    />
  );
}
