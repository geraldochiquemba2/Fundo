# Plataforma de Sustentabilidade - Fundo Verde

## Overview

The Fundo Verde platform is a comprehensive sustainability management system designed for companies to calculate their carbon footprint, invest in Sustainable Development Goals (SDGs), and track their environmental impact. The application serves as a bridge between carbon emissions calculation and sustainable investment opportunities in Angola.

## System Architecture

### High-Level Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React SPA     │◄──►│   Express.js    │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript, comprehensive API endpoints
- **Database**: PostgreSQL via Supabase (serverless), Drizzle ORM
- **Authentication**: Custom session-based authentication with bcrypt
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **Deployment**: Optimized for Replit hosting environment

## Key Components

### Frontend Architecture

The frontend is built with modern React patterns and optimized for performance:

1. **Component Structure**:
   - UI components using shadcn/ui design system
   - Custom business logic components
   - Layout components (Navbar, Sidebar, Footer)
   - Specialized components (ProjectCard, OdsIcon)

2. **State Management**:
   - React Query for server state management
   - Custom hooks for business logic
   - Context API for authentication and onboarding

3. **Routing**: 
   - Wouter for lightweight client-side routing
   - Protected routes for authenticated users
   - Role-based access control (Admin vs Company)

### Backend Architecture

The Express.js backend provides a comprehensive API with:

1. **Authentication System**:
   - Custom session-based authentication
   - Password hashing with bcrypt
   - Role-based access control (admin/company)

2. **Database Layer**:
   - Drizzle ORM for type-safe database operations
   - Connection pooling for optimal performance
   - Comprehensive schema with relationships

3. **Performance Optimizations**:
   - Response compression
   - Static file caching
   - Database connection pooling
   - Preload cache for frequently accessed data

## Data Flow

### Carbon Footprint Calculation Flow

1. **Data Input**: Companies input consumption data (energy, fuel, water, waste)
2. **Calculation**: Backend calculates CO2 emissions using predefined factors
3. **Compensation**: System calculates required investment for carbon offset
4. **Investment**: Companies can invest in SDG projects to offset emissions
5. **Tracking**: Dashboard shows progress and impact metrics

### Investment Tracking Flow

1. **Project Selection**: Companies browse available SDG projects
2. **Investment Submission**: Upload payment proofs and investment details
3. **Admin Review**: Admin validates and approves investments
4. **Public Display**: Approved investments appear on public project pages
5. **Impact Metrics**: System tracks and displays collective impact

## External Dependencies

### Core Dependencies

- **@neondatabase/serverless**: Neon Database integration for PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Comprehensive UI component library
- **bcryptjs**: Password hashing for security
- **express-session**: Session management

### Development Dependencies

- **tsx**: TypeScript execution for development
- **vite**: Frontend build tool and development server
- **esbuild**: Fast JavaScript bundler for production
- **tailwindcss**: Utility-first CSS framework

### Optional Integrations

- **WhatsApp Web.js**: Automated messaging and notifications
- **Multer**: File upload handling for logos and documents
- **QR Code Terminal**: WhatsApp QR code generation

## Deployment Strategy

### Build Process

1. **Frontend Build**: Vite compiles React application to static assets
2. **Backend Build**: esbuild bundles Express.js server for production
3. **Database Setup**: Drizzle migrations create and update database schema
4. **Environment Configuration**: Environment variables for database and session secrets

### Production Optimizations

1. **Static File Serving**: Optimized caching headers for assets
2. **Compression**: Gzip compression for all responses
3. **Database Pooling**: Connection reuse for better performance
4. **Error Handling**: Comprehensive error logging and user feedback

### Environment Setup

```bash
# Development
npm run dev          # Start development server
npm run db:push      # Apply database schema changes
npm run db:seed      # Populate database with initial data

# Production
npm run build        # Build for production
npm start           # Start production server
```

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Enhanced cache invalidation system:
  • Reduced cache TTL from 30-120 minutes to 2-5 minutes for dynamic content
  • Added comprehensive cache clearing on project updates, creation, and deletion
  • Implemented cache invalidation for investment updates and project modifications
  • Added manual cache clearing endpoint for admin users
  • Fixed project cover image update issues by improving cache invalidation
  • Enhanced cache headers with must-revalidate for better synchronization across tabs
- July 04, 2025. Real-time updates and cross-device image optimization:
  • Fixed real-time project updates across all pages through improved cache invalidation
  • Reduced query stale time to 30 seconds for faster real-time updates
  • Implemented comprehensive cache invalidation on all project mutations (create, edit, delete)
  • Created intelligent image loading system with fallback mechanisms
  • Added smart image loading hook to prevent infinite loading loops
  • Enhanced image serving with mobile optimization and proper cache headers
  • Fixed cross-device image loading issues with multiple extension fallbacks
  • Added image verification endpoint for better error handling
- July 04, 2025. Aggressive image cache-busting for immediate updates:
  • Implemented project-specific timestamp system for per-project cache invalidation
  • Added multiple random parameters and timestamps to force immediate image refresh
  • Enhanced smart image loading hook with aggressive cache-busting parameters
  • Created forceProjectImageRefresh function for instant image updates after edits
  • Added multiple sequential refetch calls to ensure immediate visual updates
  • Updated all image rendering throughout the application with cache-busting URLs
  • Fixed edit dialog image display to show updated images immediately
  • Eliminated all image caching delays across admin publications and public views
- July 14, 2025. Enhanced ODS selection and individual reports:
  • Added "Deixar o admin escolher" option in ODS selection dropdown for individuals
  • Created global investment totals API endpoint to show total funding received by each ODS
  • Updated individual payment proof form to display global investment amounts for each ODS
  • Enhanced backend to handle admin_choice option for ODS selection
  • Added individuals section to admin reports page with recent individuals listing
  • Updated reports navigation to include 4 tabs: Investimentos, Empresas, Pessoas, Emissões
  • Added comprehensive individual statistics display in reports
- July 14, 2025. Messaging system improvements:
  • Successfully removed subject field from messaging system as requested
  • Fixed authentication issues preventing admin messaging functionality
  • Confirmed admin login credentials (admin@gmail.com / 123456789)
  • Verified message sending between admin and users works correctly
  • WhatsApp/SMS integration available but requires system dependencies (Chrome/Chromium) not available in Replit
  • All messaging endpoints functional: /api/messages, /api/admin/messages, /api/whatsapp/send-message
- July 14, 2025. Chat-like messaging interface for better organization:
  • Implemented conversation list view for both admin and user messaging pages
  • Added contact-first navigation - users see conversation participants before opening individual chats
  • Created WhatsApp-like chat interface with message bubbles and real-time input
  • Enhanced conversation grouping showing last message, unread count, and timestamps
  • Added conversation threading for cleaner message organization
  • Improved UX with back navigation between conversation list and individual chats
  • Both admin and user views now use consistent chat interface design
- July 15, 2025. Supabase database integration completed:
  • Successfully connected the project to Supabase PostgreSQL database
  • All 13 database tables created and properly configured with foreign key relationships
  • Database schema includes: users, companies, individuals, sdgs, projects, consumption_records, payment_proofs, investments, messages, and more
  • Sample data populated: 17 SDGs, 3 projects, 12 companies, 15 users
  • All API endpoints working correctly with the new database connection
  • Database connection optimized with connection pooling for better performance
  • Implemented automatic database keepalive system to prevent hibernation:
    - Internal ping system every 5 minutes
    - Health check endpoint at /health for external monitoring
    - Documentation and scripts for external monitoring setup
    - System prevents database hibernation while maintaining free tier limits
```