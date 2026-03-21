"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, Chip } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface DigestItem {
  id: string;
  digestType: string;
  aiSummary?: string | null;
  periodStart: string;
  periodEnd: string;
  deliveredAt?: string | null;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [digests, setDigests] = useState<DigestItem[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationRes, digestRes] = await Promise.all([
        api.notifications.getMy({ page: 1, limit: 50 }),
        api.smartAlerts.getDigests({ page: 1, limit: 20 }),
      ]);

      setNotifications(notificationRes?.items || []);
      setDigests(digestRes?.items || []);
    } catch (error) {
      console.error("Failed to load notifications page", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      toast.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      console.error("Failed to mark all notifications", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 pt-6 px-4 sm:px-6 lg:px-8 w-full max-w-360 mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">Notification Center</h1>
          <p className="text-[#717680] dark:text-gray-400 mt-1">Theo dõi thông báo realtime và digest.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="flat" onPress={markAllAsRead}>Đánh dấu tất cả đã đọc</Button>
          <Link href="/dashboard/notifications/preferences">
            <Button color="primary">Tùy chọn</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Thông báo</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-[#717680]">Chưa có thông báo.</p>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className={`rounded-lg border p-3 ${item.isRead ? 'border-[#e9eaeb]' : 'border-primary/40 bg-primary/5'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#181d27] dark:text-white">{item.title}</p>
                    <p className="text-sm text-[#717680]">{item.message}</p>
                    <p className="text-xs text-[#98a2b3] mt-1">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  {!item.isRead && (
                    <Button size="sm" variant="light" onPress={() => void markAsRead(item.id)}>
                      Đã đọc
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-lg font-semibold">Digest</h2>
          {digests.length === 0 ? (
            <p className="text-sm text-[#717680]">Chưa có digest.</p>
          ) : (
            digests.map((digest) => (
              <div key={digest.id} className="rounded-lg border border-[#e9eaeb] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-[#181d27] dark:text-white">
                    Digest {digest.digestType === 'weekly' ? 'tuần' : 'ngày'}
                  </p>
                  <Chip size="sm" color={digest.deliveredAt ? 'success' : 'warning'} variant="flat">
                    {digest.deliveredAt ? 'Delivered' : 'Pending'}
                  </Chip>
                </div>
                <p className="text-sm text-[#717680] mt-1">
                  {new Date(digest.periodStart).toLocaleDateString('vi-VN')} - {new Date(digest.periodEnd).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm text-[#181d27] dark:text-gray-200 mt-2">
                  {digest.aiSummary || 'Digest đang được tổng hợp...'}
                </p>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
