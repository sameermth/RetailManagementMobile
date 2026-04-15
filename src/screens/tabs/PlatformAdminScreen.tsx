import React from "react";

import { SettingsScreen } from "./SettingsScreen";

export function PlatformAdminScreen({
  onDirtyChange,
  onRegisterBackHandler,
}: {
  onDirtyChange?: (dirty: boolean) => void;
  onRegisterBackHandler?: (handler: (() => boolean) | null) => void;
}) {
  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      onRegisterBackHandler={onRegisterBackHandler}
      initialView="platform"
      allowedViews={["platform"]}
      title="Platform Admin"
      subtitle="Control panel for stores, subscriptions, notifications, health, and internal platform operations."
    />
  );
}
