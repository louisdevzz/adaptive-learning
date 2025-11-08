# Adaptive Learning Frontend

Modern React-based frontend application for the Adaptive Learning platform, featuring a responsive UI with type-safe routing and real-time updates.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Rsbuild](https://img.shields.io/badge/Rsbuild-1e40af?style=for-the-badge&logo=rspack&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)

## Tech Stack

- ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black) **React 18** - Latest stable React with TypeScript
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) **TypeScript** - Type-safe JavaScript for better developer experience
- ![TanStack](https://img.shields.io/badge/TanStack-FF4154?logo=react&logoColor=white) **TanStack Router** - Type-safe, file-based routing solution
- ![TanStack](https://img.shields.io/badge/TanStack-FF4154?logo=react&logoColor=white) **TanStack Query** - Powerful data fetching and caching
- ![Rsbuild](https://img.shields.io/badge/Rsbuild-1e40af?logo=rspack&logoColor=white) **Rsbuild (Rspack)** - Fast build tool (alternative to Webpack/Vite)
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) **Tailwind CSS** - Utility-first CSS framework
- ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?logo=shadcnui&logoColor=white) **shadcn/ui** - Re-usable component library
- ![Sentry](https://img.shields.io/badge/Sentry-362D59?logo=sentry&logoColor=white) **Sentry** - Error tracking and performance monitoring

## Project Structure

```
frontend/
├── src/
│   ├── routes/              # File-based routes
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Home page
│   │   ├── login.tsx       # Login page
│   │   ├── dashboard/      # Dashboard routes
│   │   ├── learn/          # Learning interface routes
│   │   └── profile/        # Profile routes
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI primitives
│   │   ├── layout/         # Layout components
│   │   ├── learning/       # Learning-specific components
│   │   └── common/         # Common components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   │   ├── api.ts          # API client configuration
│   │   ├── auth.ts         # Authentication service
│   │   ├── content.ts      # Content service
│   │   └── analytics.ts    # Analytics service
│   ├── stores/             # State management (Zustand/Jotai)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── rsbuild.config.ts       # Rsbuild configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended), npm, or yarn

### Installation

1. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Using npm
   npm install

   # Using yarn
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:8000
   VITE_APP_NAME=Adaptive Learning

   # Sentry Configuration
   VITE_SENTRY_DSN=https://...@sentry.io/...
   VITE_SENTRY_ENVIRONMENT=development

   # Feature Flags
   VITE_ENABLE_DEVTOOLS=true
   ```

3. **Generate route types**
   ```bash
   npm run generate-routes
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173 in your browser

## Available Scripts

```bash
# Development
npm run dev                  # Start dev server on port 5173
npm run generate-routes      # Generate TanStack Router types

# Building
npm run build               # Build for production
npm run preview             # Preview production build

# Type Checking
tsc --noEmit               # Check TypeScript types
```

## Key Pages

### Dashboard (Role-Based)

**Student Dashboard**
- Overview of learning progress
- Recent activities
- Recommended next topics
- Performance analytics
- Upcoming deadlines

**Teacher Dashboard**
- Class overview and statistics
- Student progress monitoring
- Content management
- Assignment grading queue
- Analytics and reports

**Parent Dashboard**
- Child's learning progress
- Activity notifications
- Performance reports
- Communication with teachers

**Admin Dashboard**
- System-wide analytics
- User management
- Content moderation
- Platform configuration

### Learning Interface
- Adaptive content display
- Interactive exercises
- Real-time AI-powered feedback
- Progress tracking
- Bookmarking and notes

### Profile
- User information
- Learning statistics
- Achievement badges
- Settings and preferences
- Role-specific controls

## Testing

```bash
# Run tests (when configured)
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

## Troubleshooting

### Common Issues

1. **Route types not generated**
   ```bash
   npm run generate-routes
   ```

2. **Module not found errors**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Build errors**
   - Check TypeScript errors: `tsc --noEmit`
   - Clear Rsbuild cache: `rm -rf .rsbuild`

4. **Hot reload not working**
   - Check Rsbuild config
   - Restart dev server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

See the main [README.md](../README.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
