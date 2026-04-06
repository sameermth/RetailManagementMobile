import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function SystemScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="system"
      allowedViews={["workspace", "service", "system", "platform"]}
      title="System"
      subtitle="Organization, branches, employees, service operations, and platform tooling aligned to the latest backend modules."
    />
  );
}
