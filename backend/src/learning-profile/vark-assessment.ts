export type VarkModality =
  | 'visual'
  | 'auditory'
  | 'reading'
  | 'kinesthetic';

export interface VarkAssessmentOption {
  key: string;
  text: string;
  modality: VarkModality;
}

export interface VarkAssessmentQuestion {
  id: string;
  prompt: string;
  options: VarkAssessmentOption[];
}

export interface VarkAssessmentAnswer {
  questionId: string;
  selectedOptionKey: string;
}

export interface VarkScores {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

export interface ProcessedVarkAssessment {
  scores: VarkScores;
  dominantStyle: VarkModality;
  totalAnswers: number;
}

export const VARK_ASSESSMENT_VERSION = 1;

export const VARK_QUESTIONS: VarkAssessmentQuestion[] = [
  {
    id: 'q1',
    prompt: 'Khi học một chủ đề mới, em thường muốn bắt đầu theo cách nào?',
    options: [
      { key: 'a', text: 'Xem sơ đồ hoặc hình minh họa', modality: 'visual' },
      { key: 'b', text: 'Nghe thầy cô giải thích', modality: 'auditory' },
      { key: 'c', text: 'Đọc tài liệu hoặc ghi chú', modality: 'reading' },
      { key: 'd', text: 'Làm thử ví dụ ngay', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q2',
    prompt: 'Khi cần nhớ kiến thức lâu hơn, em thường:',
    options: [
      { key: 'a', text: 'Vẽ mindmap hoặc biểu đồ', modality: 'visual' },
      { key: 'b', text: 'Đọc to lại nội dung', modality: 'auditory' },
      { key: 'c', text: 'Viết tóm tắt theo ý chính', modality: 'reading' },
      { key: 'd', text: 'Luyện tập nhiều bài tương tự', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q3',
    prompt: 'Khi gặp bài khó, cách em thấy hiệu quả nhất là:',
    options: [
      { key: 'a', text: 'Xem video minh họa từng bước', modality: 'visual' },
      { key: 'b', text: 'Trao đổi với bạn hoặc thầy cô', modality: 'auditory' },
      { key: 'c', text: 'Đọc lời giải chi tiết', modality: 'reading' },
      { key: 'd', text: 'Tự thử nhiều cách giải', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q4',
    prompt: 'Trong giờ học, em tập trung tốt nhất khi:',
    options: [
      { key: 'a', text: 'Có slide/ảnh trực quan', modality: 'visual' },
      { key: 'b', text: 'Được nghe giảng rõ ràng', modality: 'auditory' },
      { key: 'c', text: 'Có tài liệu đọc trước', modality: 'reading' },
      { key: 'd', text: 'Có hoạt động thực hành', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q5',
    prompt: 'Khi ôn kiểm tra, em thường ưu tiên:',
    options: [
      { key: 'a', text: 'Xem lại biểu đồ công thức', modality: 'visual' },
      { key: 'b', text: 'Nghe lại bài giảng/ghi âm', modality: 'auditory' },
      { key: 'c', text: 'Đọc lại vở ghi có hệ thống', modality: 'reading' },
      { key: 'd', text: 'Giải đề luyện tập', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q6',
    prompt: 'Em hiểu nhanh hơn khi kiến thức được trình bày bằng:',
    options: [
      { key: 'a', text: 'Hình ảnh, màu sắc, sơ đồ', modality: 'visual' },
      { key: 'b', text: 'Giọng nói và ví dụ kể chuyện', modality: 'auditory' },
      { key: 'c', text: 'Văn bản ngắn gọn, rõ ràng', modality: 'reading' },
      { key: 'd', text: 'Mô phỏng, thao tác trực tiếp', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q7',
    prompt: 'Nếu phải giải thích bài cho bạn, em sẽ:',
    options: [
      { key: 'a', text: 'Vẽ hình hoặc sơ đồ', modality: 'visual' },
      { key: 'b', text: 'Nói và ví dụ bằng lời', modality: 'auditory' },
      { key: 'c', text: 'Viết từng bước ra giấy', modality: 'reading' },
      { key: 'd', text: 'Làm mẫu trực tiếp', modality: 'kinesthetic' },
    ],
  },
  {
    id: 'q8',
    prompt: 'Khi chọn tài liệu học thêm, em thường thích:',
    options: [
      { key: 'a', text: 'Video hoặc infographic', modality: 'visual' },
      { key: 'b', text: 'Podcast hoặc thuyết minh', modality: 'auditory' },
      { key: 'c', text: 'Bài viết, sách, handout', modality: 'reading' },
      { key: 'd', text: 'Bài tập tương tác, thực hành', modality: 'kinesthetic' },
    ],
  },
];

const EMPTY_SCORES: VarkScores = {
  visual: 0,
  auditory: 0,
  reading: 0,
  kinesthetic: 0,
};

export function processVarkAssessment(
  answers: VarkAssessmentAnswer[],
): ProcessedVarkAssessment {
  const lookup = new Map<string, VarkAssessmentQuestion>(
    VARK_QUESTIONS.map((question) => [question.id, question]),
  );

  const counts: Record<VarkModality, number> = {
    visual: 0,
    auditory: 0,
    reading: 0,
    kinesthetic: 0,
  };

  let total = 0;

  for (const answer of answers) {
    const question = lookup.get(answer.questionId);
    if (!question) {
      continue;
    }

    const option = question.options.find(
      (candidate) => candidate.key === answer.selectedOptionKey,
    );
    if (!option) {
      continue;
    }

    counts[option.modality] += 1;
    total += 1;
  }

  if (total === 0) {
    return {
      scores: EMPTY_SCORES,
      dominantStyle: 'visual',
      totalAnswers: 0,
    };
  }

  const scores: VarkScores = {
    visual: Math.round((counts.visual / total) * 100),
    auditory: Math.round((counts.auditory / total) * 100),
    reading: Math.round((counts.reading / total) * 100),
    kinesthetic: Math.round((counts.kinesthetic / total) * 100),
  };

  const dominantStyle = (Object.entries(scores) as [VarkModality, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    scores,
    dominantStyle,
    totalAnswers: total,
  };
}
