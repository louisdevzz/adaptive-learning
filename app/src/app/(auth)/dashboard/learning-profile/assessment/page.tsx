"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Radio, RadioGroup, Progress, Spinner } from "@heroui/react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";

type QuestionOption = {
  key: "a" | "b" | "c" | "d";
  text: string;
};

type Question = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

export default function LearningProfileAssessmentPage() {
  const { user } = useUser();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.learningProfile.getAssessmentQuestions();
        setQuestions(data.questions || []);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "student") {
      load();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const completedCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progressValue = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((completedCount / questions.length) * 100);
  }, [completedCount, questions.length]);

  const handleSubmit = async () => {
    if (questions.length === 0 || completedCount !== questions.length) {
      return;
    }

    setSubmitting(true);
    try {
      await api.learningProfile.submitAssessment({
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedOptionKey: answers[question.id],
        })),
      });
      router.push("/dashboard/learning-profile");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return (
      <Card>
        <CardBody className="py-10 text-center text-default-500">
          Chỉ học sinh mới có thể làm bài đánh giá học tập.
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-base font-semibold">Đánh giá phong cách học VARK</p>
          <p className="text-sm text-default-500">
            Chọn 1 đáp án phù hợp nhất với thói quen học của em cho mỗi câu hỏi.
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Progress value={progressValue} color="secondary" />
          <p className="text-xs text-default-500">
            Hoàn thành {completedCount}/{questions.length} câu
          </p>
        </CardBody>
      </Card>

      {questions.map((question, idx) => (
        <Card key={question.id}>
          <CardHeader className="text-sm font-medium">
            Câu {idx + 1}. {question.prompt}
          </CardHeader>
          <CardBody>
            <RadioGroup
              value={answers[question.id]}
              onValueChange={(value) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: value as "a" | "b" | "c" | "d",
                }))
              }
            >
              {question.options.map((option) => (
                <Radio key={option.key} value={option.key}>
                  {option.text}
                </Radio>
              ))}
            </RadioGroup>
          </CardBody>
        </Card>
      ))}

      <div className="flex items-center justify-end gap-2">
        <Button variant="flat" onPress={() => router.push("/dashboard/learning-profile")}>Hủy</Button>
        <Button
          color="secondary"
          onPress={handleSubmit}
          isLoading={submitting}
          isDisabled={questions.length === 0 || completedCount !== questions.length}
        >
          Nộp bài đánh giá
        </Button>
      </div>
    </div>
  );
}
