'use client';

import React, { useState } from 'react';
import { Card } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Select, SelectItem } from '@heroui/select';
import { Divider } from '@heroui/divider';
import { Tabs, Tab } from '@heroui/tabs';
import { Chip } from '@heroui/chip';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Palette,
  Key,
  Server,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Download,
  Upload,
  Lock,
  Unlock,
} from 'lucide-react';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  timezone: string;
  language: string;
  dateFormat: string;
  maintenanceMode: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  auditLogging: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnCourseComplete: boolean;
  notifyOnSystemAlert: boolean;
  digestFrequency: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  senderName: string;
  senderEmail: string;
}

interface SystemSettingsProps {
  generalSettings: GeneralSettings;
  securitySettings: SecuritySettings;
  notificationSettings: NotificationSettings;
  emailSettings: EmailSettings;
  onSaveGeneral: (settings: GeneralSettings) => void;
  onSaveSecurity: (settings: SecuritySettings) => void;
  onSaveNotification: (settings: NotificationSettings) => void;
  onSaveEmail: (settings: EmailSettings) => void;
  onClearCache: () => void;
  onBackupDatabase: () => void;
  onRestoreDatabase: () => void;
  onTestEmail: () => void;
  isSaving?: boolean;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  generalSettings: initialGeneral,
  securitySettings: initialSecurity,
  notificationSettings: initialNotification,
  emailSettings: initialEmail,
  onSaveGeneral,
  onSaveSecurity,
  onSaveNotification,
  onSaveEmail,
  onClearCache,
  onBackupDatabase,
  onRestoreDatabase,
  onTestEmail,
  isSaving,
}) => {
  const [general, setGeneral] = useState<GeneralSettings>(initialGeneral);
  const [security, setSecurity] = useState<SecuritySettings>(initialSecurity);
  const [notification, setNotification] = useState<NotificationSettings>(initialNotification);
  const [email, setEmail] = useState<EmailSettings>(initialEmail);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h2>
        <p className="text-gray-600">Quản lý cấu hình và tùy chỉnh hệ thống</p>
      </div>

      <Tabs aria-label="Settings tabs" color="danger">
        {/* General Settings Tab */}
        <Tab
          key="general"
          title={
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Chung
            </div>
          }
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tên hệ thống"
                  placeholder="Adaptive Learning"
                  value={general.siteName}
                  onValueChange={(value) => setGeneral({ ...general, siteName: value })}
                />
                <Input
                  label="Email liên hệ"
                  type="email"
                  placeholder="admin@example.com"
                  value={general.contactEmail}
                  onValueChange={(value) => setGeneral({ ...general, contactEmail: value })}
                />
              </div>
              <Textarea
                label="Mô tả hệ thống"
                placeholder="Mô tả ngắn về hệ thống..."
                value={general.siteDescription}
                onValueChange={(value) => setGeneral({ ...general, siteDescription: value })}
              />
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Múi giờ"
                  selectedKeys={[general.timezone]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setGeneral({ ...general, timezone: value });
                  }}
                >
                  <SelectItem key="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</SelectItem>
                  <SelectItem key="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                  <SelectItem key="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                </Select>
                <Select
                  label="Ngôn ngữ"
                  selectedKeys={[general.language]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setGeneral({ ...general, language: value });
                  }}
                >
                  <SelectItem key="vi">Tiếng Việt</SelectItem>
                  <SelectItem key="en">English</SelectItem>
                </Select>
                <Select
                  label="Định dạng ngày"
                  selectedKeys={[general.dateFormat]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setGeneral({ ...general, dateFormat: value });
                  }}
                >
                  <SelectItem key="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem key="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem key="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </Select>
              </div>
              <Divider />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Chế độ bảo trì</p>
                  <p className="text-sm text-gray-500">Tạm ngừng truy cập hệ thống để bảo trì</p>
                </div>
                <Switch
                  isSelected={general.maintenanceMode}
                  onValueChange={(value) => setGeneral({ ...general, maintenanceMode: value })}
                  color="danger"
                >
                  {general.maintenanceMode ? 'Đang bật' : 'Đang tắt'}
                </Switch>
              </div>
              <div className="flex justify-end">
                <Button
                  color="danger"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={() => onSaveGeneral(general)}
                  isLoading={isSaving}
                >
                  Lưu cài đặt
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        {/* Security Settings Tab */}
        <Tab
          key="security"
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Bảo mật
            </div>
          }
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Xác thực 2 yếu tố</p>
                  <p className="text-sm text-gray-500">Yêu cầu mã xác thực khi đăng nhập</p>
                </div>
                <Switch
                  isSelected={security.twoFactorAuth}
                  onValueChange={(value) => setSecurity({ ...security, twoFactorAuth: value })}
                  color="success"
                />
              </div>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Độ dài mật khẩu tối thiểu"
                  placeholder="8"
                  value={security.passwordMinLength.toString()}
                  onValueChange={(value) => setSecurity({ ...security, passwordMinLength: parseInt(value) || 8 })}
                />
                <Input
                  type="number"
                  label="Thời gian hết phiên (phút)"
                  placeholder="30"
                  value={security.sessionTimeout.toString()}
                  onValueChange={(value) => setSecurity({ ...security, sessionTimeout: parseInt(value) || 30 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Yêu cầu ký tự đặc biệt</p>
                  <p className="text-sm text-gray-500">Mật khẩu phải chứa ký tự đặc biệt</p>
                </div>
                <Switch
                  isSelected={security.passwordRequireSpecial}
                  onValueChange={(value) => setSecurity({ ...security, passwordRequireSpecial: value })}
                  color="success"
                />
              </div>
              <Divider />
              <Input
                type="number"
                label="Số lần đăng nhập thất bại tối đa"
                placeholder="5"
                value={security.maxLoginAttempts.toString()}
                onValueChange={(value) => setSecurity({ ...security, maxLoginAttempts: parseInt(value) || 5 })}
                description="Tài khoản sẽ bị khóa sau số lần đăng nhập thất bại này"
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Ghi log kiểm toán</p>
                  <p className="text-sm text-gray-500">Ghi lại tất cả hoạt động người dùng</p>
                </div>
                <Switch
                  isSelected={security.auditLogging}
                  onValueChange={(value) => setSecurity({ ...security, auditLogging: value })}
                  color="success"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  color="danger"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={() => onSaveSecurity(security)}
                  isLoading={isSaving}
                >
                  Lưu cài đặt
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        {/* Notification Settings Tab */}
        <Tab
          key="notifications"
          title={
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Thông báo
            </div>
          }
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Kênh thông báo</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">Gửi thông báo qua email</p>
                  </div>
                  <Switch
                    isSelected={notification.emailNotifications}
                    onValueChange={(value) => setNotification({ ...notification, emailNotifications: value })}
                    color="success"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push notification</p>
                    <p className="text-sm text-gray-500">Thông báo đẩy trên trình duyệt</p>
                  </div>
                  <Switch
                    isSelected={notification.pushNotifications}
                    onValueChange={(value) => setNotification({ ...notification, pushNotifications: value })}
                    color="success"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">SMS</p>
                    <p className="text-sm text-gray-500">Gửi thông báo qua tin nhắn</p>
                  </div>
                  <Switch
                    isSelected={notification.smsNotifications}
                    onValueChange={(value) => setNotification({ ...notification, smsNotifications: value })}
                    color="success"
                  />
                </div>
              </div>
              <Divider />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Sự kiện thông báo</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Người dùng mới</p>
                    <p className="text-sm text-gray-500">Thông báo khi có người đăng ký mới</p>
                  </div>
                  <Switch
                    isSelected={notification.notifyOnNewUser}
                    onValueChange={(value) => setNotification({ ...notification, notifyOnNewUser: value })}
                    color="success"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Hoàn thành khóa học</p>
                    <p className="text-sm text-gray-500">Thông báo khi học sinh hoàn thành khóa học</p>
                  </div>
                  <Switch
                    isSelected={notification.notifyOnCourseComplete}
                    onValueChange={(value) => setNotification({ ...notification, notifyOnCourseComplete: value })}
                    color="success"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Cảnh báo hệ thống</p>
                    <p className="text-sm text-gray-500">Thông báo lỗi và cảnh báo hệ thống</p>
                  </div>
                  <Switch
                    isSelected={notification.notifyOnSystemAlert}
                    onValueChange={(value) => setNotification({ ...notification, notifyOnSystemAlert: value })}
                    color="success"
                  />
                </div>
              </div>
              <Divider />
              <Select
                label="Tần suất email tổng hợp"
                selectedKeys={[notification.digestFrequency]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setNotification({ ...notification, digestFrequency: value });
                }}
              >
                <SelectItem key="realtime">Ngay lập tức</SelectItem>
                <SelectItem key="hourly">Mỗi giờ</SelectItem>
                <SelectItem key="daily">Hàng ngày</SelectItem>
                <SelectItem key="weekly">Hàng tuần</SelectItem>
              </Select>
              <div className="flex justify-end">
                <Button
                  color="danger"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={() => onSaveNotification(notification)}
                  isLoading={isSaving}
                >
                  Lưu cài đặt
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        {/* Email Settings Tab */}
        <Tab
          key="email"
          title={
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </div>
          }
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SMTP Host"
                  placeholder="smtp.gmail.com"
                  value={email.smtpHost}
                  onValueChange={(value) => setEmail({ ...email, smtpHost: value })}
                />
                <Input
                  type="number"
                  label="SMTP Port"
                  placeholder="587"
                  value={email.smtpPort.toString()}
                  onValueChange={(value) => setEmail({ ...email, smtpPort: parseInt(value) || 587 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SMTP Username"
                  placeholder="username"
                  value={email.smtpUser}
                  onValueChange={(value) => setEmail({ ...email, smtpUser: value })}
                />
                <Input
                  type="password"
                  label="SMTP Password"
                  placeholder="********"
                  value={email.smtpPassword}
                  onValueChange={(value) => setEmail({ ...email, smtpPassword: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Kết nối bảo mật (SSL/TLS)</p>
                  <p className="text-sm text-gray-500">Sử dụng kết nối mã hóa</p>
                </div>
                <Switch
                  isSelected={email.smtpSecure}
                  onValueChange={(value) => setEmail({ ...email, smtpSecure: value })}
                  color="success"
                />
              </div>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tên người gửi"
                  placeholder="Adaptive Learning"
                  value={email.senderName}
                  onValueChange={(value) => setEmail({ ...email, senderName: value })}
                />
                <Input
                  type="email"
                  label="Email người gửi"
                  placeholder="noreply@example.com"
                  value={email.senderEmail}
                  onValueChange={(value) => setEmail({ ...email, senderEmail: value })}
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="flat"
                  startContent={<Mail className="w-4 h-4" />}
                  onPress={onTestEmail}
                >
                  Gửi email test
                </Button>
                <Button
                  color="danger"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={() => onSaveEmail(email)}
                  isLoading={isSaving}
                >
                  Lưu cài đặt
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        {/* Database & System Tab */}
        <Tab
          key="system"
          title={
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Hệ thống
            </div>
          }
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
            <div className="space-y-6">
              {/* Cache Management */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Quản lý bộ nhớ đệm</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Xóa bộ nhớ đệm</p>
                    <p className="text-sm text-gray-500">Xóa tất cả dữ liệu cache để giải phóng bộ nhớ</p>
                  </div>
                  <Button
                    variant="flat"
                    color="warning"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={onClearCache}
                  >
                    Xóa cache
                  </Button>
                </div>
              </div>
              <Divider />
              {/* Database Backup */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Sao lưu & Khôi phục</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Sao lưu cơ sở dữ liệu</p>
                      <p className="text-sm text-gray-500">Tạo bản sao lưu toàn bộ dữ liệu</p>
                    </div>
                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Download className="w-4 h-4" />}
                      onPress={onBackupDatabase}
                    >
                      Sao lưu
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Khôi phục dữ liệu</p>
                      <p className="text-sm text-gray-500">Khôi phục từ bản sao lưu trước đó</p>
                    </div>
                    <Button
                      variant="flat"
                      color="danger"
                      startContent={<Upload className="w-4 h-4" />}
                      onPress={() => setShowRestoreModal(true)}
                    >
                      Khôi phục
                    </Button>
                  </div>
                </div>
              </div>
              <Divider />
              {/* System Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin hệ thống</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Phiên bản</p>
                    <p className="font-medium text-gray-900">v1.0.0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Môi trường</p>
                    <p className="font-medium text-gray-900">Production</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Database</p>
                    <p className="font-medium text-gray-900">PostgreSQL 15</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                    <p className="font-medium text-gray-900">{new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Restore Confirmation Modal */}
      <Modal isOpen={showRestoreModal} onClose={() => setShowRestoreModal(false)}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            Xác nhận khôi phục
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Việc khôi phục dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại. Hành động này không thể hoàn tác.
            </p>
            <p className="text-sm text-danger mt-2">
              Bạn có chắc chắn muốn tiếp tục?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowRestoreModal(false)}>
              Hủy
            </Button>
            <Button
              color="danger"
              onPress={() => {
                onRestoreDatabase();
                setShowRestoreModal(false);
              }}
            >
              Xác nhận khôi phục
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
