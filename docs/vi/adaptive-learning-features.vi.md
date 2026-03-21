# Tính năng Học tập Thích ứng bằng AI

## Tổng quan

Tài liệu này mô tả 4 giai đoạn xây dựng tính năng học tập thích ứng (adaptive learning) thực sự dựa trên AI cho nền tảng. Các tính năng này thay thế hệ thống đánh giá mastery nhị phân cũ (đúng=100, sai=0) bằng mô hình xác suất, đồng thời ghi dữ liệu vào các bảng `student_mastery`, `student_insights` và `recommendation_events` (trước đây luôn trống).

---

## Giai đoạn 1: BKT Mastery Engine (Theo dõi kiến thức Bayesian)

**Các file liên quan:**
- `backend/src/student-progress/bkt-mastery.service.ts` — Tính toán BKT thuần (stateless)
- `backend/src/student-progress/bkt-mastery.service.spec.ts` — 14 unit tests
- `backend/src/student-progress/student-progress.service.ts` — Sửa `submitQuestionAttempt()`
- `backend/src/student-progress/student-progress.module.ts` — Đăng ký `BktMasteryService`

### Thay đổi gì?

Thay thế cách tính mastery nhị phân (`isCorrect ? 100 : 0`) bằng **Bayesian Knowledge Tracing (BKT)** — một mô hình xác suất đã được chứng minh hiệu quả trong lĩnh vực khai phá dữ liệu giáo dục.

### Thuật toán BKT

```
P(L|đúng)  = P(L)*(1-P(S)) / [P(L)*(1-P(S)) + (1-P(L))*P(G)]
P(L|sai)   = P(L)*P(S)     / [P(L)*P(S) + (1-P(L))*(1-P(G))]
P(L_tiếp)  = P(L|phản hồi) + (1-P(L|phản hồi)) * P(T)
```

**Tham số mặc định:**
| Tham số | Giá trị | Ý nghĩa |
|---------|---------|---------|
| P(L₀) | 0.2 | Xác suất ban đầu đã biết kiến thức |
| P(T) | 0.1 | Xác suất học được qua mỗi lần thử |
| P(S) | 0.1 | Xác suất nhầm lẫn (biết nhưng trả lời sai) |
| P(G) | 0.25 | Xác suất đoán mò (chưa biết nhưng trả lời đúng) |

**Tự động điều chỉnh tham số:** Các tham số BKT được tính từ `question_metadata.difficulty` và `discrimination` nếu có, nếu không sẽ dùng `knowledge_point.difficultyLevel` làm dự phòng.

### Tổng hợp Mastery theo khóa học

Sau mỗi lần trả lời câu hỏi, `updateCourseMastery()` được gọi bất đồng bộ để:
1. Tìm tất cả khóa học chứa điểm kiến thức (KP) vừa làm
2. Tính trung bình mastery của tất cả KP trong mỗi khóa
3. Cập nhật bảng `student_mastery` với điểm tổng, điểm mạnh (≥80), và điểm yếu (<40)

### Hành vi

- 5 câu đúng liên tiếp → mastery tăng đơn điệu (từ 20% lên ~60-70%)
- 5 câu sai liên tiếp → mastery giảm nhưng không bao giờ về 0 (nhờ hệ số chuyển đổi học tập)
- Trả lời lẫn lộn → cải thiện ròng phản ánh mức hiểu thực tế

---

## Giai đoạn 2: Phân tích Insights học sinh bằng AI

**Các file liên quan:**
- `backend/src/student-insights/student-insights.module.ts`
- `backend/src/student-insights/student-insights.service.ts` — Cron (2h sáng hàng ngày) + sự kiện
- `backend/src/student-insights/student-insights-analyzer.ts` — Tính toán thuần (không DB, không AI)
- `backend/src/student-insights/student-insights-analyzer.spec.ts` — 13 unit tests
- `backend/src/app.module.ts` — Đăng ký `StudentInsightsModule`

### Các chỉ số tính toán

| Chỉ số | Logic |
|--------|-------|
| **Điểm mạnh** | Các KP có masteryScore ≥ 80 |
| **Điểm yếu** | Các KP có masteryScore < 60 VÀ đã thử ≥ 3 lần |
| **KP có nguy cơ** | Điểm giảm > 15 trong 7 ngày, HOẶC mastery thấp (<50) + không hoạt động ≥ 5 ngày |
| **Mẫu hình học tập** | Thời gian trung bình/câu hỏi, xu hướng tốc độ (cải thiện/giảm sút/ổn định), điểm nhất quán |
| **Điểm tương tác** | Tổ hợp có trọng số: lượt thử gần đây (40%) + phút học (30%) + nhất quán (30%) |

### Kích hoạt

1. **Cron hàng ngày lúc 2:00 sáng** — xử lý tất cả học sinh đang hoạt động (đang ghi danh ít nhất một lớp)
2. **Theo sự kiện** — phản ứng với sự kiện `progress.updated` khi `|delta| ≥ 15`

### Làm giàu bằng AI

Khi học sinh có ≥ 10 lượt thử tổng cộng, hệ thống gọi LLM (temperature 0.3) để tạo lý do bằng tiếng Việt cho từng điểm mạnh và điểm yếu. Nếu AI lỗi, kết quả dựa trên luật vẫn được sử dụng bình thường.

---

## Giai đoạn 3: Hệ thống Gợi ý bằng AI

**Các file liên quan:**
- `backend/src/learning-paths/recommendation.service.ts`
- `backend/src/learning-paths/recommendation.service.spec.ts` — 4 unit tests
- `backend/src/learning-paths/learning-paths.module.ts` — Đăng ký `RecommendationService`

### Bộ luật gợi ý

| Ưu tiên | Luật | Điều kiện | Loại |
|---------|------|-----------|------|
| 1 | Lỗ hổng tiên quyết | KP yếu VÀ kiến thức tiên quyết của nó cũng yếu | `review` (ôn tập kiến thức tiên quyết) |
| 2 | Ôn tập | masteryScore < 40 | `review` |
| 3 | Luyện tập | 40 ≤ masteryScore < 60 | `practice` |
| 4 | Nâng cao | masteryScore ≥ 85 VÀ KP phụ thuộc chưa bắt đầu | `advance` |

### AI dự phòng

Khi có ≥ 3 KP yếu VÀ không có luật lỗ hổng tiên quyết nào kích hoạt → gọi LLM (temperature 0.2) để xếp hạng theo mức ưu tiên học tập. Trả về top 5 mục. Nếu AI lỗi, sắp xếp theo mastery tăng dần.

### Lưu trữ

Tất cả gợi ý được ghi vào bảng `recommendation_events` với:
- `recommendation_type`: review / practice / advance
- `student_action`: mặc định `ignored` (cập nhật khi học sinh tương tác)
- `metadata`: số thứ tự ưu tiên và chuỗi lý do

---

## Giai đoạn 4: Nâng cấp Lộ trình Học tập bằng AI

**Các file liên quan:**
- `backend/db/schema.ts` — Thêm `metadata: json('metadata').default({})` vào `learning_path_items`
- `backend/drizzle/0015_watery_firebird.sql` — File migration
- `backend/src/learning-paths/learning-path-auto-generation.service.ts` — Nâng cấp lớn

### Thay đổi gì?

`LearningPathAutoGenerationService` giờ đây:

1. **Gọi `RecommendationService`** trước khi tạo lộ trình — các KP được gợi ý sẽ được ưu tiên sắp xếp
2. **Tiêu đề do AI tạo** — LLM (temperature 0.7) tạo tiêu đề lộ trình bằng tiếng Việt; dự phòng bằng chuỗi cố định
3. **Mô tả do AI tạo** — LLM tạo mô tả lộ trình với ngữ cảnh về các mục và mức mastery
4. **Lý do cho từng mục** — Gọi AI theo batch để tạo lý do cho mỗi KP trong lộ trình, lưu trong `learning_path_items.metadata.reason`

### Luồng xử lý

```
analyzeAndUpdatePath(studentId)
  ├── generateRecommendations() → ghi vào recommendation_events
  ├── identifyWeakAreas()
  ├── gộp & ưu tiên (gợi ý trước, rồi đến các điểm yếu còn lại)
  ├── expandWithPrerequisites()
  ├── generateItemReasons() → gọi AI theo batch
  ├── generatePathTitle() → gọi AI
  ├── generatePathDescription() → gọi AI
  └── createNewPath() hoặc updateExistingPath() → ghi vào learning_path + learning_path_items
```

---

## Các quyết định thiết kế xuyên suốt

### Xử lý lỗi AI
Tất cả lệnh gọi AI đều được bọc trong try/catch. Nếu LLM lỗi, hệ thống tự động chuyển sang kết quả dựa trên luật. Lỗi AI không bao giờ làm crash dịch vụ hoặc chặn pipeline.

### Lọc sự kiện
Giai đoạn 2 & 3 chỉ phản ứng với `progress.updated` khi `|delta| ≥ 15` để tránh tính toán lại quá nhiều.

### Bảo vệ xử lý đồng thời
Mỗi giai đoạn sử dụng `processingStudents: Set<string>` để ngăn xử lý trùng lặp cho cùng một học sinh.

### Sử dụng mô hình AI
Tất cả lệnh gọi AI sử dụng `createChatModel()` từ `backend/src/common/ai/chat-model.factory.ts`:
- **Temperature 0.2** — tác vụ phân tích/xếp hạng (gợi ý)
- **Temperature 0.3** — phân tích insights
- **Temperature 0.7** — nội dung sáng tạo (tiêu đề, mô tả lộ trình)

### Thay đổi Schema cơ sở dữ liệu
Migration `0015_watery_firebird.sql` thêm cột `metadata` kiểu JSON vào `learning_path_items` (mặc định `{}`). Đây là thay đổi bổ sung, không phá vỡ tương thích.

---

## Tổng kết kiểm thử

| File | Số test |
|------|---------|
| `bkt-mastery.service.spec.ts` | 14 passed |
| `student-insights-analyzer.spec.ts` | 13 passed |
| `recommendation.service.spec.ts` | 4 passed |
| **Tổng cộng** | **31 passed** |
