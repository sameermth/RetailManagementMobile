import React from "react";

import { useAppData } from "../../store/AppDataContext";
import { hasAnyPermission, hasPermission } from "../../utils/access";
import { SettingsScreen } from "./SettingsScreen";

export function SystemScreen({
  onDirtyChange,
  onRegisterBackHandler,
}: {
  onDirtyChange?: (dirty: boolean) => void;
  onRegisterBackHandler?: (handler: (() => boolean) | null) => void;
}) {
  const { session } = useAppData();
  const canWorkspace = hasAnyPermission(session, ["settings.manage", "users.manage"]);
  const canService = hasAnyPermission(session, ["service.view", "service.manage", "service.claims"]);
  const canSystem = hasAnyPermission(session, ["settings.manage", "users.manage", "approvals.manage"]);
  const canPlatform = hasPermission(session, "platform.manage");
  const allowedViews = [
    ...(canWorkspace ? (["workspace"] as const) : []),
    ...(canService ? (["service"] as const) : []),
    ...(canSystem ? (["system"] as const) : []),
    ...(canPlatform ? (["platform"] as const) : []),
  ];
  const initialView = allowedViews.includes("system")
    ? "system"
    : allowedViews[0] ?? "workspace";

  return (
    <SettingsScreen
      onDirtyChange={onDirtyChange}
      onRegisterBackHandler={onRegisterBackHandler}
      initialView={initialView}
      allowedViews={allowedViews}
      title="System"
      subtitle="Organization, branches, employees, service operations, approvals, and platform tooling aligned to the latest backend modules."
    />
  );
}
