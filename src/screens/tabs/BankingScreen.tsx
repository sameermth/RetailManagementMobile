import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function BankingScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="finance"
      allowedViews={["finance"]}
      title="Banking"
      subtitle="Banking overview, account balances, statement imports, and reconciliation actions aligned to web flows."
    />
  );
}
