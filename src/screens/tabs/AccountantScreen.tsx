import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function AccountantScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="finance"
      allowedViews={["finance"]}
      title="Accountant"
      subtitle="Chart of accounts, manual vouchers, and finance summaries mapped to the web accounting section."
    />
  );
}
