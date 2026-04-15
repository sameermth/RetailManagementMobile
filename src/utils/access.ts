import { SessionState } from "../data/entities";
import { AppModuleKey } from "../types";

type UserScope = Pick<SessionState, "permissions" | "roles"> | null | undefined;

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function getPermissionSet(session: UserScope) {
  return new Set((session?.permissions ?? []).map(normalize).filter(Boolean));
}

export function getRoleSet(session: UserScope) {
  return new Set((session?.roles ?? []).map(normalize).filter(Boolean));
}

export function hasPermission(session: UserScope, permission: string) {
  return getPermissionSet(session).has(normalize(permission));
}

export function hasAnyPermission(session: UserScope, permissions: string[]) {
  const set = getPermissionSet(session);
  return permissions.some((permission) => set.has(normalize(permission)));
}

export function hasRole(session: UserScope, role: string) {
  return getRoleSet(session).has(normalize(role));
}

export function canAccessModule(session: UserScope, module: AppModuleKey) {
  if (!session) {
    return false;
  }
  switch (module) {
    case "dashboard":
      return hasPermission(session, "dashboard.view");
    case "sales":
      return hasAnyPermission(session, ["sales.view", "sales.create", "payments.customer"]);
    case "purchases":
      return hasAnyPermission(session, ["purchases.view", "purchases.create", "purchases.receive", "payments.supplier"]);
    case "inventory":
      return hasAnyPermission(session, ["inventory.view", "inventory.adjust", "inventory.transfer", "masters.view"]);
    case "people":
      return hasAnyPermission(session, ["masters.view", "masters.manage"]);
    case "finance":
      return hasAnyPermission(session, ["payments.customer", "payments.supplier", "expenses.view", "expenses.create", "expenses.approve"]);
    case "reports":
      return hasPermission(session, "reports.view");
    case "system":
      return hasAnyPermission(session, ["settings.manage", "users.manage", "approvals.manage", "service.view", "service.manage", "service.claims"]);
    case "platform":
      return hasPermission(session, "platform.manage") || hasRole(session, "platform_admin");
    default:
      return false;
  }
}
