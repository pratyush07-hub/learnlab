# 🧪 LearnLab - Premium Research Mentorship Platform

**Connect young researchers (ages 9-19) with world-class mentors for personalized research guidance.**

## ✨ Features

### 🎯 Core Platform
- **Premium Homepage** with asymmetric layouts, orange/black/white theme, and micro-interactions
- **Multi-role Authentication** (Students, Mentors, Admins) via Supabase Auth
- **Real-time Chat System** with file sharing and emoji support
- **Smart Notifications** with browser push notifications
- **Mobile-first Responsive Design** with touch-friendly interface

### 👨‍🎓 For Students
- **Gamified Dashboard** with progress tracking and achievements
- **AI-Powered Mentor Matching** based on interests and goals
- **Project Workspace** with timeline, Kanban boards, and milestones
- **Session Management** with video calls and note-taking
- **Resource Library** with curated research materials

### 👩‍🏫 For Mentors  
- **Professional Profile Builder** with credentials verification
- **Calendar Management** with availability scheduling
- **Student Progress Tracking** with detailed analytics
- **Earnings Dashboard** with financial reporting
- **Resource Creation Tools** for sharing knowledge

### 🔧 For Administrators
- **Comprehensive Admin Panel** with system analytics
- **Mentor Approval Workflow** with credential verification
- **User Management System** with role-based permissions
- **Financial Reporting** with payment tracking
- **Platform Analytics** with performance metrics

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom theme
- **Framer Motion** - Premium animations and micro-interactions
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Database-level security
- **Real-time Subscriptions** - Live updates and notifications
- **Storage Buckets** - File and media management

### Features & Integrations
- **Responsive Design** - Mobile-first with touch optimization
- **PWA Support** - Progressive Web App capabilities
- **Real-time Chat** - WebSocket-based messaging
- **Payment Processing** - Stripe integration ready
- **File Uploads** - Secure document and media handling

## 📁 Project Structure

```
learnlab.skillorbitx/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── dashboard/          # Student dashboard  
│   │   ├── mentor/             # Mentor portal
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable UI components
│   │   ├── AuthModal.tsx       # Authentication modal
│   │   ├── Chat.tsx            # Real-time chat
│   │   ├── MobileNav.tsx       # Mobile navigation
│   │   └── NotificationCenter.tsx # Notification system
│   └── lib/                    # Utility libraries
│       └── supabase.ts         # Supabase client & helpers
├── database/
│   └── schema.sql              # Complete database schema
├── public/                     # Static assets
│   └── manifest.json           # PWA manifest
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone & Install
```bash
git clone <repository-url>
cd learnlab.skillorbitx
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Configure Row Level Security policies

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the platform.

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#FF4500` - Call-to-action buttons, highlights
- **Orange Variations**: `#E03E00`, `#C73600` - Gradients, hover states  
- **Black**: `#0A0A0A` - Text, dark sections
- **White**: `#FFFFFF` - Backgrounds, cards
- **Grays**: Various shades for text and borders

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300-900 for comprehensive hierarchy
- **Responsive sizing** with mobile optimizations

### Components
- **Glass Morphism**: Translucent cards with backdrop blur
- **Gradient Backgrounds**: Orange to black transitions
- **Micro-interactions**: Hover effects, button animations
- **Asymmetric Layouts**: Modern, engaging grid systems

## 📱 Mobile Experience

### Responsive Breakpoints
- **Mobile**: `< 640px` - Single column, large touch targets
- **Tablet**: `641px - 1024px` - Balanced layouts
- **Desktop**: `> 1024px` - Full asymmetric designs

### Mobile Features
- **Bottom Navigation** for quick access
- **Swipe Gestures** for navigation
- **Touch-optimized** buttons (44px minimum)
- **Safe Area Support** for notched devices
- **Reduced Motion** respect for accessibility

## 🔐 Security Features

### Authentication
- **Supabase Auth** with email/password
- **Row Level Security** for data protection
- **Role-based Access Control** (Student/Mentor/Admin)
- **Session Management** with automatic refresh

### Data Protection
- **Environment Variables** for sensitive data
- **HTTPS Enforcement** in production
- **Input Validation** on all forms
- **SQL Injection Protection** via Supabase

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

See `DEPLOYMENT.md` for complete deployment guide.

## 📊 Database Schema

### Key Tables
- **profiles** - User profiles with role-based data
- **mentor_profiles** - Extended mentor information
- **student_profiles** - Student-specific data
- **projects** - Research projects and milestones
- **sessions** - Mentorship sessions with scheduling
- **messages** - Real-time chat system
- **payments** - Financial transactions
- **notifications** - System notifications

### Features
- **Automatic Timestamps** with triggers
- **Foreign Key Constraints** for data integrity
- **Indexes** for optimal query performance
- **RLS Policies** for security

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] Homepage with premium design
- [x] Authentication system
- [x] Basic dashboards for all user types
- [x] Database schema implementation

### Phase 2: Enhanced Features 🚧
- [ ] Advanced mentor matching algorithm
- [ ] Video calling integration
- [ ] Payment processing with Stripe
- [ ] Advanced project management tools

### Phase 3: Scale & Optimize 📋
- [ ] Performance optimization
- [ ] Advanced analytics
- [ ] Mobile app development
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write responsive, mobile-first code
- Add proper error handling
- Include JSDoc comments for functions

## 📞 Support

### Documentation
- **User Guides**: Available in the platform
- **API Documentation**: Coming soon
- **Video Tutorials**: In development

### Contact
- **Technical Issues**: Create an issue in this repository
- **Business Inquiries**: Contact the development team
- **Feature Requests**: Use the issue tracker

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the next generation of researchers**

*LearnLab - Where curiosity meets expertise*