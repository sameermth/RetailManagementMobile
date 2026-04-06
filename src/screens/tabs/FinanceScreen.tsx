import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function FinanceScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="finance"
      allowedViews={["finance"]}
      title="Finance"
      subtitle="Accounts, vouchers, expenses, and bank reconciliation flows shaped around the live finance endpoints."
    />
  );
}
