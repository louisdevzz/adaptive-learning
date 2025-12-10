# 🎓 Adaptive Learning Platform v3.0

> Adaptive Learning là nền tảng học tập thông minh được thiết kế để cá nhân hoá hành trình học của từng học sinh. Hệ thống phân rã kiến thức thành các đơn vị nhỏ (Knowledge Points), theo dõi mức độ nắm vững theo thời gian thực và tự động đề xuất nội dung phù hợp với năng lực hiện tại. Dựa trên phân tích hành vi, mô hình dự đoán và bản đồ kiến thức, nền tảng liên tục điều chỉnh bài học, đánh giá và lộ trình để tạo trải nghiệm học tập hiệu quả hơn, giảm quá tải và tối ưu tốc độ tiến bộ của mỗi người học.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-FF6B6B?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 Abstract

Adaptive Learning Platform v3.0 là hệ thống cá nhân hóa học tập dựa trên phân rã kiến thức, mô hình dự đoán và theo dõi năng lực theo thời gian thực. Hệ thống được thiết kế để giúp mỗi học sinh nhận được lộ trình học phù hợp với năng lực và tốc độ riêng. Bằng cách sử dụng kiến trúc Course → Module → Section → Knowledge Point và mô hình Mastery Tracking, nền tảng cung cấp khả năng đánh giá, gợi ý học tập và điều chỉnh nội dung một cách tự động nhằm tối ưu hiệu quả học tập.

## 🎯 Core Concepts

### 2.1 Knowledge Point (KP)

Knowledge Point là đơn vị kiến thức nhỏ nhất. Mỗi KP đại diện cho một kỹ năng hoặc khái niệm cụ thể, ví dụ:

- "Nhân đa thức với đơn thức"
- "Định luật Newton 1"
- "Phân biệt câu bị động"

### 2.2 Mastery

Mastery mô tả mức độ hiểu biết của học sinh đối với một KP. Nó được đo bằng nhiều tín hiệu:

- Điểm số bài tập
- Số lần sai
- Tốc độ giải
- Lịch sử học
- Mức độ khó của câu hỏi đã làm

### 2.3 Learning Path

Learning Path là lộ trình học động, được hệ thống tự động sắp xếp dựa trên:

- Mastery hiện tại
- Mục tiêu khóa học
- Các KP phụ thuộc nhau (dependency graph)

## 🏗️ System Architecture

### Course Structure

Hệ thống được xây dựng theo mô hình phân cấp:

```
Course → Module → Section → Knowledge Point
```

Mỗi lớp dữ liệu được thiết kế để hỗ trợ:

- Quản lý nội dung mạch lạc
- Tái sử dụng nội dung giữa các khóa học
- Liên kết KP chính xác với bài tập, video, và bài kiểm tra

### Mastery Engine

Mastery Engine là trung tâm phân tích dữ liệu học tập.

**Chức năng chính**:

- Tính toán mastery score theo thời gian thực
- Dự đoán KP mà học sinh sẽ gặp khó
- Cập nhật trạng thái "Ready to Learn", "Struggling", "Mastered"

Các mô hình có thể ứng dụng:

- Item Response Theory (IRT)
- Bayesian Knowledge Tracing
- Deep Knowledge Tracing (DL, LSTM)
- Rule-based Mastery Models

### Recommendation Engine

Engine gợi ý học tập dựa trên:

- Mức độ nắm vững
- Dependency graph của KP
- Learning Path hiện tại
- Mục tiêu và tiến độ của khóa học

Nó quyết định:

- Bài học tiếp theo
- Bài tập luyện tập tương ứng
- Thời điểm cần kiểm tra lại
- Thời điểm cần "remediation" (ôn lại)

### Assessment Engine

Máy chấm điểm & phân tích:

- Tự sinh bài tập theo KP
- Phân cấp độ khó câu hỏi
- Phân tích lỗi thường gặp
- Sinh diagnostic report cho học sinh và giáo viên

## 📊 Data Flow

### Input Data

- Hành vi học tập (clicks, thời gian xem)
- Bài tập, điểm số
- Bảng mastery theo KP
- Thứ tự kiến thức phụ thuộc nhau
- Metadata của khóa học

### Processing

1. Dữ liệu được thu thập và chuẩn hóa
2. Mastery Engine cập nhật trạng thái
3. Recommendation Engine chọn mục học tiếp
4. Learning Path được cập nhật
5. Dashboard phản hồi giáo viên + học sinh

### Output

- Lộ trình học cá nhân hóa
- Report tiến độ
- Gợi ý nội dung phù hợp
- Chẩn đoán điểm yếu

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe ORM
- **TypeScript** - Type-safe JavaScript
- **JWT** - Authentication & authorization

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your database URL and API keys

# Run database migrations
pnpm run db:push

# Start development server
pnpm run start:dev
```

API will be available at `http://localhost:3000/api`

### Frontend Setup

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 👥 User Roles

- **Admin** - Full system access
- **Teacher** - Create/manage content, view progress
- **Student** - Access content, track progress
- **Parent** - View child's progress

## 📈 Evaluation

Hệ thống được đánh giá dựa trên:

- Tốc độ nắm vững kiến thức
- Tỉ lệ giảm lỗi lặp lại
- Thời gian hoàn thành khóa học
- Mức độ phù hợp của gợi ý
- Độ chính xác của mô hình mastery

Kết quả ban đầu cho thấy adaptive learning giảm 20–40% thời gian học và tăng đáng kể khả năng ghi nhớ dài hạn.

## 📚 Project Structure

```
adaptive-learning/
├── backend/          # NestJS backend API
│   ├── src/         # Source code
│   ├── db/          # Database schema & migrations
│   └── dist/        # Compiled output
├── app/             # Next.js frontend
│   └── src/
│       ├── app/     # Next.js App Router pages
│       ├── components/  # React components
│       └── lib/     # Utilities & API client
└── README.md        # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For questions and support, please open an issue in the GitHub repository.
