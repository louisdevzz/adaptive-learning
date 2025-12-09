/**
 * Constants for system permissions
 * Each permission has a key (used in backend) and a Vietnamese label
 */
export const PERMISSIONS = {
  // User Management
  "manage_users": "Quản lý người dùng",
  "view_users": "Xem người dùng",
  "create_users": "Tạo người dùng",
  "edit_users": "Sửa người dùng",
  "delete_users": "Xóa người dùng",

  // Student Management
  "manage_students": "Quản lý học sinh",
  "view_students": "Xem học sinh",
  "create_students": "Tạo học sinh",
  "edit_students": "Sửa học sinh",
  "delete_students": "Xóa học sinh",

  // Teacher Management
  "manage_teachers": "Quản lý giáo viên",
  "view_teachers": "Xem giáo viên",
  "create_teachers": "Tạo giáo viên",
  "edit_teachers": "Sửa giáo viên",
  "delete_teachers": "Xóa giáo viên",

  // Parent Management
  "manage_parents": "Quản lý phụ huynh",
  "view_parents": "Xem phụ huynh",
  "create_parents": "Tạo phụ huynh",
  "edit_parents": "Sửa phụ huynh",
  "delete_parents": "Xóa phụ huynh",

  // Admin Management
  "manage_admins": "Quản lý quản trị viên",
  "view_admins": "Xem quản trị viên",
  "create_admins": "Tạo quản trị viên",
  "edit_admins": "Sửa quản trị viên",
  "delete_admins": "Xóa quản trị viên",

  // Course Management
  "manage_courses": "Quản lý khóa học",
  "view_courses": "Xem khóa học",
  "create_courses": "Tạo khóa học",
  "edit_courses": "Sửa khóa học",
  "delete_courses": "Xóa khóa học",

  // Class Management
  "manage_classes": "Quản lý lớp học",
  "view_classes": "Xem lớp học",
  "create_classes": "Tạo lớp học",
  "edit_classes": "Sửa lớp học",
  "delete_classes": "Xóa lớp học",

  // Content Management
  "manage_content": "Quản lý nội dung",
  "view_content": "Xem nội dung",
  "create_content": "Tạo nội dung",
  "edit_content": "Sửa nội dung",
  "delete_content": "Xóa nội dung",

  // Report Management
  "manage_reports": "Quản lý báo cáo",
  "view_reports": "Xem báo cáo",
  "create_reports": "Tạo báo cáo",
  "edit_reports": "Sửa báo cáo",
  "delete_reports": "Xóa báo cáo",

  // System Settings
  "manage_settings": "Quản lý cài đặt",
  "view_settings": "Xem cài đặt",
  "edit_settings": "Sửa cài đặt",

  // Analytics
  "view_analytics": "Xem phân tích",
  "manage_analytics": "Quản lý phân tích",

  // System Administration
  "manage_system": "Quản lý hệ thống",
  "backup_system": "Sao lưu hệ thống",
  "restore_system": "Khôi phục hệ thống",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Get all available permission keys
 */
export const getAllPermissionKeys = (): PermissionKey[] => {
  return Object.keys(PERMISSIONS) as PermissionKey[];
};

/**
 * Get all permission labels
 */
export const getAllPermissionLabels = (): string[] => {
  return Object.values(PERMISSIONS);
};

