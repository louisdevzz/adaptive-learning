🎮 Adaptive Learning – Game Generation Specification (v1.0)
1. Overview

Hệ thống sử dụng cơ chế “AI-generated Game Blueprint” để tự động sinh mini-game tương tác cho mỗi Knowledge Point (KP).
Game không được lưu dưới dạng HTML/JS/CSS. Thay vào đó:

Frontend chứa Game Engine Template cố định.

Database lưu Game Blueprint dạng JSON.

Mỗi lần học sinh truy cập KP → engine đọc blueprint → tự render game.

Game có thể random nội dung dựa theo “randomization rules” trong blueprint.

Cách thiết kế này giảm tải cho giáo viên, tối ưu hoá tốc độ và đảm bảo khả năng mở rộng.

2. System Architecture
2.1 Components

AI Game Generator (LLM Agent)

Nhận input từ KP

Xác định loại game phù hợp

Sinh ra Game Blueprint dạng JSON

Không tạo UI code

Backend

Lưu blueprint vào DB

Cung cấp API: GET /kp/{id}/game

Frontend Game Engine

Code cố định

Render game dựa trên blueprint

Áp dụng randomization mỗi lượt chơi

Database

Lưu blueprint_json dạng JSON

3. Game Generation Workflow
Step 1. Input từ KP

AI receives:

KP Title

Learning Objective

Optional: Example questions

Step 2. AI phân tích KP

Xác định bản chất kiến thức

Chọn game_type phù hợp

Sinh data + luật chấm điểm + random rules

Step 3. AI xuất Game Blueprint JSON

Blueprint có thể từ 2–10 KB.

Step 4. Backend lưu vào DB

Không chỉnh sửa dữ liệu.

Step 5. FE nhận blueprint → render game

FE engine đọc blueprint → render theo game_type.

4. Game Types Supported

AI Agent phải chọn một loại phù hợp:

drag_drop

match_pairs

fill_blank

multi_choice

sorting

logic_puzzle

fraction_builder

word_arrangement

Mỗi game_type có cấu trúc riêng được engine quản lý.

5. Game Blueprint Specification
5.1 Structure
{
  "version": "1.0",
  "kp_id": "string",
  "game_type": "drag_drop",
  "difficulty": 1,
  "instructions": "string",
  "initial_data": {},
  "randomization": {},
  "evaluation": {},
  "hints": [],
  "metadata": {}
}

5.2 Field Descriptions
version

Version để Game Engine biết cách parse.

game_type

Loại game. Không được tự tạo tên mới.

instructions

Hướng dẫn cho học sinh, dạng câu đơn giản.

initial_data

Dữ liệu tĩnh để render game.
Ví dụ game drag-drop fractions:

{
  "items": [
    {"label": "2/3", "answer": "4/6"},
    {"label": "1/2", "answer": "3/6"}
  ]
}

randomization

Luật sinh dữ liệu mỗi lần chơi:

{
  "numerator_range": [1, 9],
  "denominator_range": [2, 12],
  "shuffle_items": true
}

evaluation

Logic chấm điểm:

{
  "type": "match",
  "rule": "item.label must equal simplified(result)"
}

hints

Danh sách gợi ý.

metadata

Thông tin thêm: tags, source, note.

6. Example Blueprint
Drag & Drop Fraction Example
{
  "version": "1.0",
  "kp_id": "kp_fraction_add",
  "game_type": "drag_drop",
  "difficulty": 2,
  "instructions": "Kéo phân số thích hợp vào kết quả đúng.",
  "initial_data": {
    "pairs": [
      {"left": "2/3 + 1/6", "right": "5/6"},
      {"left": "1/4 + 3/8", "right": "5/8"}
    ]
  },
  "randomization": {
    "numerator_range": [1, 9],
    "denominator_range": [2, 12],
    "shuffle_pairs": true
  },
  "evaluation": {
    "type": "fraction_add",
    "rule": "Evaluate expression and compare to dropped answer"
  },
  "hints": [
    "Quy đồng mẫu số trước khi cộng.",
    "Nhớ rút gọn nếu cần."
  ],
  "metadata": {
    "subject": "math",
    "grade": 6
  }
}

7. FE Rendering Flow
Step 1 — FE gọi API

GET /kp/{id}/game

Step 2 — FE nhận blueprint
Step 3 — FE áp dụng randomization

Shuffle

Thay số

Generate bài toán mới

Step 4 — FE render theo game_type

Engine gọi renderer:

renderDragDrop(blueprint)

Step 5 — FE xử lý interaction

Drag events

Matching logic

Score calculation

Step 6 — FE gửi kết quả lên backend (optional)
8. Constraints for AI Agent
AI Agent không được:

Sinh HTML / CSS / JS

Sinh layout UI

Sinh animation code

Sinh component React

AI Agent phải:

Chọn đúng game_type

Sinh dữ liệu + luật random + logic chấm

Giữ dữ liệu JSON nhỏ gọn

Giữ cú pháp JSON hợp lệ

Không tạo trường mới ngoài schema

9. Backend Database Schema
CREATE TABLE kp_games (
  id UUID PRIMARY KEY,
  kp_id UUID NOT NULL,
  blueprint_json JSONB NOT NULL,
  version VARCHAR(10) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

10. API Design
Create / Update blueprint
POST /kp/{id}/game/generate
→ Trigger AI generate
→ Save to DB

Fetch game
GET /kp/{id}/game
→ Return blueprint JSON

11. Purpose

Tài liệu này cho phép một AI Agent:

Hiểu rõ cách generate game

Sinh đúng blueprint chuẩn

Không tạo code UI

Phù hợp với Game Engine frontend cố định