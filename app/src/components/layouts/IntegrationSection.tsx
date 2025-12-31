"use client";

import { Folder, Mail, Calendar, MessageCircle, Video, Cloud } from "lucide-react";

const integrations = [
  { icon: Folder, label: "Google Drive" },
  { icon: Mail, label: "Email" },
  { icon: Calendar, label: "Calendar" },
  { icon: MessageCircle, label: "Chat" },
  { icon: Video, label: "Video" },
  { icon: Cloud, label: "Cloud" },
];

export function IntegrationSection() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <p className="text-lg font-medium text-slate-900 dark:text-white mb-8">
          Tích hợp mượt mà với công cụ bạn yêu thích
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {integrations.map((integration, idx) => {
            const Icon = integration.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-16 h-16 flex items-center justify-center"
              >
                <Icon className="w-8 h-8 text-slate-400" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

