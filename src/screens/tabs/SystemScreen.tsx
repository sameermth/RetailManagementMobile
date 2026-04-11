import React from "react";

import { useAppData } from "../../store/AppDataContext";
import { hasPlatformAdminAccess } from "../../utils/access";
import { SettingsScreen } from "./SettingsScreen";

export function SystemScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { session } = useAppData();
  const showPlatformModule = hasPlatformAdminAccess(session);

  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      initialView="system"
      allowedViews={showPlatformModule ? ["workspace", "service", "system", "platform"] : ["workspace", "service", "system"]}
      title="System"
      subtitle={
        showPlatformModule
          ? "Organization, branches, employees, service operations, and platform tooling aligned to the latest backend modules."
          : "Organization, branches, employees, and service operations aligned to the latest backend modules."
      }
    />
  );
}
