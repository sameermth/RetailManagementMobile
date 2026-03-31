import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function FinanceScreen() {
  return (
    <SettingsScreen
      initialView="finance"
      allowedViews={["finance"]}
      title="Finance"
      subtitle="Accounts, vouchers, expenses, and bank reconciliation flows shaped around the live finance endpoints."
    />
  );
}
