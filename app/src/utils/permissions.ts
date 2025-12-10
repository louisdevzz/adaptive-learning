import { PERMISSIONS, PermissionKey } from "@/constants/permissions";

/**
 * Parse a single permission key to its Vietnamese label
 * @param permission - The permission key (e.g., "user.read")
 * @returns The Vietnamese label or the original key if not found
 */
export function parsePermission(permission: string): string {
  if (permission in PERMISSIONS) {
    return PERMISSIONS[permission as PermissionKey];
  }
  // If permission not found in constants, return formatted version
  return formatPermissionKey(permission);
}

/**
 * Parse multiple permission keys to their Vietnamese labels
 * @param permissions - Array of permission keys
 * @returns Array of Vietnamese labels
 */
export function parsePermissions(permissions: string[]): string[] {
  return permissions.map(parsePermission);
}

/**
 * Format a permission key to a readable Vietnamese label
 * Falls back to formatting the key if not in constants
 * Supports both underscore (manage_users) and dot notation (user.manage)
 * @param permission - The permission key
 * @returns Formatted label
 */
function formatPermissionKey(permission: string): string {
  // Replace underscores with spaces and split, or split by dot
  const separator = permission.includes("_") ? "_" : ".";
  const parts = permission.split(separator);
  
  const formatted = parts
    .map((part) => {
      // Capitalize first letter and lowercase the rest
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
  
  return formatted;
}

/**
 * Get permission label by key
 * @param key - Permission key
 * @returns Vietnamese label or undefined if not found
 */
export function getPermissionLabel(key: string): string | undefined {
  if (key in PERMISSIONS) {
    return PERMISSIONS[key as PermissionKey];
  }
  return undefined;
}

/**
 * Check if a permission key exists in constants
 * @param key - Permission key to check
 * @returns True if exists, false otherwise
 */
export function isValidPermission(key: string): boolean {
  return key in PERMISSIONS;
}

