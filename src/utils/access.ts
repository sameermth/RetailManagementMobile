import { SessionState } from "../data/entities";

const PLATFORM_ROLE_EXACT_MATCH = new Set([
  "platform_admin",
  "platformadmin",
  "platform-admin",
  "super_admin",
  "superadmin",
]);

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function hasPlatformAdminAccess(session: SessionState | null | undefined) {
  if (!session) {
    return false;
  }

  const roles = (session.roles ?? []).map(normalize).filter(Boolean);
  const permissions = (session.permissions ?? []).map(normalize).filter(Boolean);
  const membershipRoles = (session.memberships ?? [])
    .map((membership) => normalize(membership.roleCode))
    .filter(Boolean);

  const roleGranted = [...roles, ...membershipRoles].some((role) => {
    if (PLATFORM_ROLE_EXACT_MATCH.has(role)) {
      return true;
    }
    return role.includes("platform") && (role.includes("admin") || role.includes("ops"));
  });

  if (roleGranted) {
    return true;
  }

  return permissions.some((permission) => {
    if (permission === "platform:*" || permission === "platform_admin" || permission === "platform:admin") {
      return true;
    }
    return permission.startsWith("platform.") || permission.startsWith("platform:");
  });
}
