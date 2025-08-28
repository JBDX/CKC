# Team Points Scoring System (CKC)

## Overview

A full-stack web application for managing team points and activities in an educational setting. The system allows teachers to log in and award points to teams while providing a public dashboard for viewing team standings and recent activities. Built with React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and styled with Tailwind CSS and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript in SPA (Single Page Application) mode
- **Routing**: Wouter for client-side routing with pages for home, login, score entry, and 404
- **State Management**: TanStack Query (React Query) for server state and caching, custom AuthService for authentication state
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Build Tool**: Vite with custom configuration for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript running in ESM mode
- **API Design**: RESTful API with endpoints for authentication, team data, and activity tracking
- **Database Layer**: Drizzle ORM with Neon serverless PostgreSQL connection using connection pooling
- **Session Management**: Simple stateless authentication (basic username/password validation)
- **Development Setup**: Custom Vite integration for hot module replacement in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **ORM**: Drizzle ORM with schema definition in TypeScript
- **Schema Design**:
  - Teachers table with username/password authentication
  - Teams table with members array, scores, colors, and icons
  - Score entries table tracking all point changes with timestamps and relationships
- **Migrations**: Drizzle-kit for database schema migrations and management

### Authentication and Authorization
- **Authentication Method**: Username and password-based login (birth date as password)
- **Session Handling**: Simple client-side state management without persistent sessions
- **Access Control**: Basic role separation between public viewing and teacher score entry
- **Security**: Minimal implementation suitable for controlled educational environment

### External Dependencies
- **Database**: Neon serverless PostgreSQL with WebSocket support for real-time connections
- **UI Components**: Extensive use of Radix UI primitives through shadcn/ui for accessible components
- **Styling**: Tailwind CSS with custom CSS variables for theming and team colors
- **Development Tools**: Replit integration with cartographer plugin and runtime error overlay for development environment
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)