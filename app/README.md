# 🎨 Adaptive Learning - Frontend

Frontend application for Adaptive Learning Platform built with Next.js 15 and React 19.

## 📖 Overview

Frontend của Adaptive Learning Platform cung cấp giao diện người dùng hiện đại, responsive cho tất cả các vai trò: Student, Teacher, Parent, và Admin. Ứng dụng được xây dựng với Next.js 15 để tận dụng Server-Side Rendering (SSR) và tối ưu SEO.

## ✨ Features

- **Dashboard cho từng vai trò** - Giao diện tùy chỉnh cho Student, Teacher, Parent, Admin
- **Visualization Mastery** - Hiển thị bản đồ kiến thức và mức độ nắm vững theo KP graph
- **Learning Path UI** - Giao diện playlist học tập động
- **Real-time Progress Tracking** - Theo dõi tiến độ học tập theo thời gian thực
- **Responsive Design** - Tối ưu cho mọi thiết bị

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **HeroUI** - Component library
- **Lucide React** - Icon library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Environment Setup

```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout with providers
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components (Header, Sidebar)
│   │   ├── learning/     # Learning components
│   │   ├── dashboard/    # Dashboard components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities & API client
│   │   └── utils.ts      # Helper functions
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── components.json        # shadcn/ui configuration
└── package.json
```

## 🎨 UI Components

The project uses **HeroUI** and **shadcn/ui** for UI components. Components are located in `src/components/ui/`.

## 🔌 API Integration

The frontend communicates with the NestJS backend API. API client configuration is in `src/lib/`.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🧪 Testing

Testing setup coming soon.

## 📄 License

This project is licensed under the MIT License.

