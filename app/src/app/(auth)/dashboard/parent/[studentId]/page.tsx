"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, Tab, Tabs, Textarea } from "@heroui/react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { WeeklyReportCard } from "@/components/parent/WeeklyReportCard";
import { useUser } from "@/hooks/useUser";

interface SummaryResponse {
  student: {
    fullName: string;
    gradeLevel: number;
    schoolName: string;
  };
  overallMastery: number;
  weeklyActivity: {
    attemptsCount: number;
    studyTimeMinutes: number;
  };
  insights: {
    strengths?: unknown[];
    weaknesses?: unknown[];
    riskKps?: unknown[];
    engagementScore?: number;
  } | null;
}

interface WeeklyReportsResponse {
  items: Array<{
    id: string;
    weekStart: string;
    weekEnd: string;
    overallMastery: number;
    masteryChange: number;
    studyTimeMinutes: number;
    attemptsCount: number;
    strengthsCount: number;
    weaknessesCount: number;
    riskKpsCount: number;
    aiSummary: string;
  }>;
}

interface RecommendationsResponse {
  suggested: Array<{
    kpId: string;
    kpTitle: string;
    masteryScore: number;
    recommendations: Array<{
      id: string;
      title: string;
      url: string;
      source: string;
      finalScore: number;
    }>;
  }>;
}

interface MessagesResponse {
  items: Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
}

export default function ParentChildDetailPage() {
  const params = useParams<{ studentId: string }>();
  const { user } = useUser();
  const studentId = params.studentId;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [reports, setReports] = useState<WeeklyReportsResponse>({ items: [] });
  const [recommendations, setRecommendations] = useState<RecommendationsResponse>({ suggested: [] });
  const [messages, setMessages] = useState<MessagesResponse>({ items: [] });
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const myUserId = user?.id || "";

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, reportsData, recommendationData, messagesData] = await Promise.all([
        api.parentDashboard.getChildSummary(studentId),
        api.parentDashboard.getChildWeeklyReports(studentId, { page: 1, limit: 10 }),
        api.parentDashboard.getChildRecommendations(studentId),
        api.parentDashboard.getMessages(studentId, { page: 1, limit: 30 }),
      ]);

      setSummary(summaryData);
      setReports(reportsData);
      setRecommendations(recommendationData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Failed to load parent child detail", error);
      toast.error("Không thể tải dữ liệu chi tiết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [studentId]);

  const riskCount = useMemo(() => {
    if (!summary?.insights?.riskKps || !Array.isArray(summary.insights.riskKps)) {
      return 0;
    }
    return summary.insights.riskKps.length;
  }, [summary]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setSendingMessage(true);
      await api.parentDashboard.sendMessage(studentId, { message: messageText.trim() });
      setMessageText("");
      const refreshed = await api.parentDashboard.getMessages(studentId, { page: 1, limit: 30 });
      setMessages(refreshed);
      toast.success("Đã gửi tin nhắn");
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSendingMessage(false);
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#010101] dark:text-white">{summary?.student.fullName || "Chi tiết học sinh"}</h1>
        <p className="text-[#717680] dark:text-gray-400 mt-1">
          Lớp {summary?.student.gradeLevel} • {summary?.student.schoolName}
        </p>
      </div>

      <Tabs aria-label="Parent detail tabs" color="primary" variant="underlined">
        <Tab key="summary" title="Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Card><CardBody><p className="text-sm text-[#717680]">Mastery</p><p className="text-2xl font-bold">{summary?.overallMastery || 0}%</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Lượt làm bài tuần</p><p className="text-2xl font-bold">{summary?.weeklyActivity.attemptsCount || 0}</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">Thời gian học tuần</p><p className="text-2xl font-bold">{summary?.weeklyActivity.studyTimeMinutes || 0}p</p></CardBody></Card>
            <Card><CardBody><p className="text-sm text-[#717680]">KP nguy cơ</p><p className="text-2xl font-bold text-orange-600">{riskCount}</p></CardBody></Card>
          </div>
        </Tab>

        <Tab key="reports" title="Reports">
          <div className="flex flex-col gap-3 mt-4">
            {reports.items.length === 0 ? (
              <Card><CardBody className="text-[#717680]">Chưa có báo cáo tuần.</CardBody></Card>
            ) : (
              reports.items.map((report) => <WeeklyReportCard key={report.id} report={report} />)
            )}
          </div>
        </Tab>

        <Tab key="recommendations" title="Recommendations">
          <div className="flex flex-col gap-4 mt-4">
            {recommendations.suggested.length === 0 ? (
              <Card><CardBody className="text-[#717680]">Chưa có gợi ý tài liệu.</CardBody></Card>
            ) : (
              recommendations.suggested.map((group) => (
                <Card key={group.kpId}>
                  <CardBody className="space-y-3">
                    <div>
                      <p className="font-semibold text-[#181d27] dark:text-white">{group.kpTitle}</p>
                      <p className="text-sm text-[#717680]">Mastery hiện tại: {group.masteryScore}%</p>
                    </div>
                    <div className="space-y-2">
                      {group.recommendations.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-[#e9eaeb] p-3 hover:border-primary"
                        >
                          <p className="font-medium text-[#181d27] dark:text-white">{resource.title}</p>
                          <p className="text-xs text-[#717680]">Nguồn: {resource.source} • Score: {Math.round(resource.finalScore)}</p>
                        </a>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </Tab>

        <Tab key="messages" title="Messages">
          <div className="mt-4 space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <Textarea
                  label="Tin nhắn cho giáo viên"
                  value={messageText}
                  onValueChange={setMessageText}
                  placeholder="Nhập nội dung cần trao đổi..."
                  minRows={3}
                />
                <div className="flex justify-end">
                  <Button
                    color="primary"
                    onPress={handleSendMessage}
                    isDisabled={!messageText.trim() || sendingMessage}
                    startContent={sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  >
                    Gửi tin nhắn
                  </Button>
                </div>
              </CardBody>
            </Card>

            <div className="space-y-2">
              {messages.items.length === 0 ? (
                <Card><CardBody className="text-[#717680]">Chưa có tin nhắn.</CardBody></Card>
              ) : (
                messages.items.map((message) => {
                  const mine = message.senderId === myUserId;
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${mine ? "ml-auto bg-primary text-white" : "bg-white dark:bg-[#1f2937] border border-[#e9eaeb]"}`}
                    >
                      <p className={`text-xs mb-1 ${mine ? "text-white/80" : "text-[#717680]"}`}>{message.senderName}</p>
                      <p>{message.message}</p>
                      <p className={`text-xs mt-1 ${mine ? "text-white/80" : "text-[#717680]"}`}>{new Date(message.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
