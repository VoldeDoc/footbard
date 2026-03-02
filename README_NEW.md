# Footbard ⚽

A comprehensive community-driven football league management platform that enables local communities to organize, track, and manage their football competitions with professional-grade features.

## 🚀 What is Footbard?

Footbard is a modern web application designed to digitize and streamline local football league management. It provides communities with the tools they need to:

- **Organize Multi-Community Leagues**: Create and manage multiple football communities with their own teams, players, and competitions
- **Track Comprehensive Statistics**: Monitor player performance, team standings, match results, and detailed analytics
- **Manage Teams & Players**: Handle team rosters, player transfers, join requests, and invitations
- **Coordinate Matches**: Schedule fixtures, record live match events, submit results, and generate AI-powered match recaps
- **Facilitate Community Engagement**: Share announcements, manage community moderation, and enable user interaction
- **Provide Real-Time Analytics**: Generate insights on player performance, team statistics, and league standings

## 🎯 Key Features

### 🏆 League Management
- **Multi-Community Support**: Host multiple independent football communities
- **Flexible Team Structure**: Teams with customizable roles (Captain, Vice-Captain, Player)
- **Competition Tracking**: Organize leagues with automated standings calculation
- **Match Scheduling**: Comprehensive fixture management with status tracking

### 👥 Player & Team Management
- **Player Profiles**: Detailed statistics including goals, assists, appearances, and performance ratings
- **Team Rosters**: Dynamic team management with join requests and invitation system
- **Transfer System**: Handle player movements between teams
- **Role-Based Access**: Community moderators, admins, and super-admin controls

### 📊 Advanced Analytics
- **Performance Metrics**: Player ratings, disciplinary records, and career statistics
- **Interactive Charts**: Visual representation of statistics using Recharts
- **AI Match Recaps**: Automated match summaries powered by Google Gemini AI
- **MVP Voting**: Community-driven player recognition system

### 💻 Modern User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Sports Theme**: Professional UI with glassmorphism effects
- **Real-Time Updates**: Live match tracking and instant notifications
- **Drag & Drop**: Intuitive formation and lineup management

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with server-side rendering |
| **Language** | TypeScript 5 | Type-safe development and better developer experience |
| **Database** | PostgreSQL + Prisma ORM | Relational database with type-safe queries |
| **Authentication** | NextAuth.js v4 | Secure user authentication with JWT tokens |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework for rapid UI development |
| **UI Components** | Custom + Lucide Icons | Reusable component library with consistent design |
| **Animations** | Framer Motion | Smooth animations and micro-interactions |
| **Charts** | Recharts | Interactive data visualization |
| **AI Integration** | Google Gemini API | AI-powered match recap generation |
| **File Management** | ImageKit | Optimized image upload and delivery |
| **Email** | Nodemailer | Notification and communication system |
| **Drag & Drop** | @dnd-kit | Interactive formation and lineup management |

## 🏗️ How It Was Built

### Architecture Decisions

**1. Full-Stack Next.js Application**
- Chose Next.js App Router for its file-based routing and server-side capabilities
- Implemented API routes for backend functionality within the same codebase
- Utilized React Server Components for optimal performance

**2. Type-Safe Development**
- TypeScript throughout the entire codebase for compile-time error checking
- Prisma generates type-safe database client from schema
- Custom type definitions for NextAuth integration

**3. Database Design**
- Prisma ORM for database management with migration support
- PostgreSQL for robust relational data handling
- Normalized schema supporting multi-tenancy and complex relationships

**4. Authentication & Authorization**
- NextAuth.js for secure authentication flows
- Role-based access control (USER, COMMUNITY_MOD, ADMIN, SUPER_ADMIN)
- JWT tokens with session management

### Development Process

**Phase 2: Database Schema Design**
- Designed comprehensive database schema covering all entities
- Implemented relationships between users, communities, teams, players, and matches
- Added support for complex features like match events, standings, and statistics

**Phase 3: Authentication System**
- Configured NextAuth with credentials provider
- Implemented secure password hashing with bcryptjs
- Created protected routes with middleware

**Phase 4: Core Features Development**
- Built dashboard with overview statistics
- Implemented team and player management
- Created match center with live event tracking
- Developed standings calculation system

**Phase 5: Advanced Features**
- Integrated AI match recaps using Google Gemini
- Added file upload capabilities with ImageKit
- Implemented email notifications with Nodemailer
- Created responsive UI components and animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key (for AI features)
- ImageKit account (for file uploads)
- SMTP email service

### Installation


## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── (dashboard)/              # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard overview
│   │       ├── teams/            # Team management
│   │       ├── players/          # Player profiles & management
│   │       ├── matches/          # Match center & scheduling
│   │       ├── leagues/          # League management
│   │       ├── standings/        # League tables & rankings
│   │       ├── stats/            # Statistics & analytics
│   │       ├── announcements/    # Community announcements
│   │       ├── communities/      # Community management
│   │       ├── join-requests/    # Team join requests
│   │       ├── manage/           # Administrative tools
│   │       └── settings/         # User settings
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── teams/                # Team-related APIs
│   │   ├── players/              # Player management APIs
│   │   ├── matches/              # Match management APIs
│   │   ├── leagues/              # League APIs
│   │   ├── standings/            # Standings calculation
│   │   ├── communities/          # Community management
│   │   └── upload/               # File upload handling
│   ├── super-admin/              # Super admin interface
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
├── components/
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   ├── topbar.tsx           # Top navigation bar
│   │   └── mobile-nav.tsx       # Mobile navigation
│   ├── match/                    # Match-related components
│   │   ├── football-pitch.tsx   # Formation visualization
│   │   └── event-timeline.tsx   # Match events timeline
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx           # Button component
│   │   ├── modal.tsx            # Modal dialogs
│   │   ├── badge.tsx            # Status badges
│   │   ├── stat-card.tsx        # Statistics cards
│   │   ├── page-header.tsx      # Page headers
│   │   └── empty-state.tsx      # Empty state graphics
│   └── providers.tsx             # Context providers
├── lib/                          # Utility libraries
│   ├── prisma.ts                # Prisma client configuration
│   ├── auth.ts                  # NextAuth configuration
│   ├── session.ts               # Session management
│   ├── email.ts                 # Email service setup
│   ├── gemini.ts                # AI integration
│   ├── imagekit.ts              # File upload service
│   ├── player-stats.ts          # Statistics calculations
│   └── standings.ts             # League standings logic
├── types/
│   └── next-auth.d.ts           # NextAuth type augmentation
└── middleware.ts                 # Route protection middleware

prisma/
└── schema.prisma                 # Database schema definition
```

## 🔐 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based sessions
- **Role-Based Access Control**: Granular permissions system
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Server-side validation for all inputs
- **CSRF Protection**: Built-in Next.js CSRF protection

## 🎨 UI/UX Design Principles

- **Mobile-First**: Responsive design optimized for all devices
- **Sports Aesthetic**: Dark theme with green accents mimicking football pitches
- **Glassmorphism**: Modern UI with translucent elements
- **Micro-Interactions**: Smooth animations enhancing user experience
- **Accessibility**: WCAG compliant design with proper contrast ratios
- **Performance**: Optimized images and lazy loading

## 📈 Performance Optimizations

- **Server-Side Rendering**: Next.js App Router for fast initial page loads
- **Image Optimization**: Next.js Image component with ImageKit CDN
- **Database Queries**: Prisma with optimized relations and indexing
- **Code Splitting**: Automatic bundle splitting by Next.js
- **Caching**: Strategic caching of API responses and static assets

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Deploy on Vercel**
   - Import your GitHub repository in [Vercel](https://vercel.com)
   - Add all environment variables in the Vercel dashboard
   - Deploy automatically

3. **Database Setup**
   - Ensure your PostgreSQL database is accessible from Vercel
   - Run migrations: `npx prisma db push`

### Self-Hosting with Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent database toolkit
- **Vercel** - For the deployment platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Football Community** - For inspiration and feature requirements

---

