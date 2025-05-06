# Architecture Overview

## Overview

The Fundo Verde application is a full-stack web platform designed to help companies calculate their carbon footprint, invest in sustainable development projects, and track their environmental impact. The system allows companies to record consumption data, make investments in SDG-aligned projects, and view detailed analytics about their contributions. Administrators can manage projects, approve payments, and monitor overall system activity.

## System Architecture

### High-Level Architecture

The application follows a modern client-server architecture with:

1. **Client**: React-based SPA with TypeScript
2. **Server**: Express.js API server
3. **Database**: PostgreSQL via Neon Database (serverless)
4. **File Storage**: Local file storage for uploaded assets

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  React SPA  │<─────│  Express.js │<─────│ PostgreSQL  │
│  (Client)   │─────>│  (Server)   │─────>│ (Neon DB)   │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui, React Query
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (via Neon Database), Drizzle ORM
- **Authentication**: Session-based authentication with Passport.js
- **File Storage**: Local filesystem for uploads (logos, project images, etc.)
- **Build/Deploy**: Vite for frontend bundling, Replit for hosting

## Key Components

### Frontend Architecture

The frontend is organized into the following key areas:

1. **Pages**: Route-based React components that compose the UI for different sections
2. **Components**: Reusable UI elements, including:
   - UI components (shadcn/ui based)
   - Layout components (navbar, sidebar, footer)
   - Feature-specific components (project cards, etc.)
3. **Hooks**: Custom React hooks for shared state and behavior:
   - `useAuth`: Authentication state and operations
   - `useToast`: Toast notification system
   - `useOnboarding`: Onboarding flow management
4. **Lib**: Utility functions and configuration:
   - `queryClient`: React Query configuration
   - Protected route components
   - General utility functions

The application implements a role-based UI with separate routing and components for:
- Public users (homepage, project listings, SDG information)
- Companies (dashboard, consumption tracking, payment uploads)
- Administrators (approval workflows, company management, analytics)

### Backend Architecture

The server follows a standard Express.js architecture:

1. **API Routes**: Defined in `server/routes.ts`, handling all client requests
2. **Authentication**: Implemented with Passport.js using local strategy
3. **Database Access**: Abstracted through a storage service (`server/storage.ts`)
4. **File Uploads**: Managed with Multer middleware
5. **Server Configuration**: Environment variables for database connections, session secrets, etc.

### Database Schema

The database schema models the domain with several key entities:

1. **Users**: Base entity for both admins and companies
2. **Companies**: Extended profile for company users
3. **SDGs**: Sustainable Development Goals reference data
4. **Projects**: Sustainable projects linked to SDGs
5. **Consumption Records**: Company resource consumption tracking
6. **Payment Proofs**: Evidence of company investments
7. **Investments**: Allocated funds to specific projects

The schema uses relations to model the connections between entities, particularly the many-to-many relationship between companies and projects through investments.

## Data Flow

### Authentication Flow

1. User registers or logs in through the `/auth` endpoint
2. Server validates credentials, creates a session, and returns user data
3. Client stores user context and redirects to the appropriate dashboard
4. Protected routes check authentication status before rendering

### Company Data Flow

1. **Consumption Recording**:
   - Company inputs consumption data (energy, fuel, water)
   - System calculates CO2 emissions and compensation values
   - Data is stored in consumption records table

2. **Payment Process**:
   - Company uploads payment proof for carbon offset
   - Admin reviews and assigns to an SDG
   - Funds become available for investment in projects

3. **Investment Tracking**:
   - Investments are allocated to specific projects
   - Analytics track the impact of investments over time

### Admin Data Flow

1. **Company Management**:
   - View and manage registered companies
   - Review company profiles and consumption data

2. **Payment Approval**:
   - Review payment proofs
   - Assign payments to appropriate SDGs
   - Monitor overall financial activity

3. **Project Management**:
   - Create and update sustainable projects
   - Link projects to specific SDGs
   - Track project performance and impact

## External Dependencies

### Frontend Dependencies

- **UI Libraries**: 
  - shadcn/ui components
  - Radix UI primitives
  - Lucide icons
  - TailwindCSS

- **State Management**:
  - React Query (TanStack Query)
  - React Hook Form with Zod validation

- **Data Visualization**:
  - Recharts for dashboard analytics

### Backend Dependencies

- **Database**:
  - Neon Database (PostgreSQL serverless)
  - Drizzle ORM with Zod schema validation

- **Authentication**:
  - Passport.js with local strategy
  - Express-session with PostgreSQL session store

- **File Handling**:
  - Multer for file uploads
  - File system operations for storage

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Vite for frontend bundling
   - esbuild for server compilation
   - Combined static and API server

2. **Environment Configuration**:
   - Environment variables for database connection, session secrets, etc.
   - Production mode settings

3. **Database Management**:
   - Drizzle migrations for schema changes
   - Seed script for initial data population

The deployment pipeline includes:
- Development mode: `npm run dev` (live reload with Vite)
- Build: `npm run build` (compile frontend assets and server code)
- Production: `npm run start` (serve compiled assets from Express)

## Security Considerations

- **Authentication**: Session-based with secure password hashing (scrypt)
- **Authorization**: Role-based access control for routes and operations
- **Data Validation**: Schema validation with Zod for all inputs
- **File Uploads**: Controlled via Multer with file type and size restrictions
- **Session Management**: Secure cookies with PostgreSQL session store