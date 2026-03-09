"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  collapsed?: boolean;
}

/** Returns the URL only when it is a safe, relative internal path. */
function toSafeInternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Must start with '/' and must not be a protocol-relative URL (e.g. //evil.com)
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("://")) {
    return url;
  }
  return null;
}

export function NotificationBell({ collapsed = false }: NotificationBellProps) {
  const router = useRouter();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const unreadResult = await api.notifications.getUnreadCount();
      setUnreadCount(Number(unreadResult?.unreadCount || 0));
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadNotifications = async (silent = false) => {
    if (!user) return;
    if (!silent) setIsLoading(true);

    try {
      const [listResult, unreadResult] = await Promise.all([
        api.notifications.getMy({ limit: 8, page: 1 }),
        api.notifications.getUnreadCount(),
      ]);

      const items = Array.isArray(listResult)
        ? listResult
        : listResult?.items || [];
      setNotifications(items);
      setUnreadCount(Number(unreadResult?.unreadCount || 0));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadNotifications();

    const interval = setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    const safeUrl = toSafeInternalUrl(notification.actionUrl);
    if (safeUrl) {
      router.push(safeUrl);
    }
  };

  const relativeTime = (isoDate: string) => {
    const timestamp = new Date(isoDate).getTime();
    const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ trước`;
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
  };

  const notificationItems = useMemo(() => notifications || [], [notifications]);

  return (
    <Dropdown
      placement={collapsed ? "right-start" : "bottom-end"}
      onOpenChange={(open) => {
        if (open) void loadNotifications();
      }}
    >
      <DropdownTrigger>
        <button
          className={`relative rounded-xl border border-[#E5E5E5] bg-white hover:bg-gray-50 transition-colors ${
            collapsed
              ? "w-9 h-9 flex items-center justify-center"
              : "flex items-center gap-2 px-3 py-2"
          }`}
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4 text-[#010101]" />
          {!collapsed && (
            <span className="text-xs font-medium text-[#010101]">Thông báo</span>
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#6244F4] text-white text-[10px] font-semibold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifications menu"
        classNames={{
          base: "bg-white border border-[#E5E5E5] rounded-xl shadow-lg w-[320px] max-h-[380px] overflow-y-auto",
        }}
      >
        <DropdownItem
          key="header"
          isReadOnly
          className="text-xs text-[#666666] cursor-default"
        >
          {unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc`
            : "Không có thông báo mới"}
        </DropdownItem>

        {notificationItems.length === 0 && !isLoading ? (
          <DropdownItem
            key="empty"
            isReadOnly
            className="text-sm text-[#666666] cursor-default"
          >
            Chưa có thông báo nào
          </DropdownItem>
        ) : null}

        {isLoading && notificationItems.length === 0 ? (
          <DropdownItem
            key="loading"
            isReadOnly
            className="text-sm text-[#666666] cursor-default"
          >
            Đang tải thông báo...
          </DropdownItem>
        ) : null}

        {notificationItems.map((notification) => (
          <DropdownItem
            key={notification.id}
            textValue={`${notification.title} ${notification.message}`}
            onPress={() => void handleNotificationPress(notification)}
            className={`py-2.5 ${
              notification.isRead ? "" : "bg-[#6244F4]/5"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#010101] truncate">
                  {notification.title}
                </p>
                {!notification.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#6244F4] mt-1" />
                )}
              </div>
              <p className="text-xs text-[#666666]">
                {notification.message}
              </p>
              <p className="text-[11px] text-[#999999]">
                {relativeTime(notification.createdAt)}
              </p>
            </div>
          </DropdownItem>
        ))}

        {unreadCount > 0 ? (
          <DropdownItem
            key="mark-all"
            startContent={<CheckCheck className="w-4 h-4 text-[#6244F4]" />}
            onPress={() => void markAllAsRead()}
            className="text-sm font-medium text-[#6244F4]"
          >
            Đánh dấu tất cả đã đọc
          </DropdownItem>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
