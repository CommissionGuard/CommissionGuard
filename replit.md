# Commission Guard - Real Estate Commission Protection Platform

## Overview

Commission Guard is a comprehensive real estate commission protection platform designed for agents and brokers to monitor representation agreements, track client interactions, and prevent commission breaches. The application provides AI-powered contract analysis, property research capabilities, and automated monitoring of public records to protect real estate professionals' commissions.

## System Architecture

### Full-Stack Architecture
The application follows a modern full-stack architecture with clear separation between frontend and backend:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Authentication system with session management
- **Deployment**: Replit autoscale deployment

### Technology Stack
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Frontend Framework**: React 18 with TypeScript
- **Backend Framework**: Express.js
- **ORM**: Drizzle with PostgreSQL adapter
- **Build Tool**: Vite for frontend, esbuild for backend
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

## Key Components

### Authentication System
- **Provider**: Replit Authentication (OpenID Connect)
- **Session Management**: PostgreSQL-backed session store
- **User Roles**: Agent, Broker, Admin with role-based access control
- **Session Storage**: Mandatory sessions table for Replit Auth compatibility

### Database Schema
The application uses a comprehensive schema supporting:
- **User Management**: Users with subscription tiers and brokerage associations
- **Client Management**: Client records with contact information and representation history
- **Contract Management**: Representation agreements with multiple signers support
- **Alert System**: Automated alerts for contract expirations and potential breaches
- **Property Tracking**: Property research data and visit logs
- **Commission Protection**: Dedicated tracking for commission protection events
- **Audit Logging**: Complete audit trail for all system actions

### AI Integration
- **Service**: OpenAI GPT-4o for contract analysis and market insights
- **Contract Analysis**: Risk assessment, expiration tracking, and commission term analysis
- **Market Analysis**: Property valuation trends and investment scoring
- **Legal Support**: AI-powered legal document analysis

### External API Integrations
- **Google Maps**: Geocoding and property location services
- **Regrid**: Property parcel data and ownership information
- **RentCast**: Rental market data and property listings
- **Optional Integrations**: MLS, Zillow, Public Records APIs
- **Payment Processing**: Stripe integration for subscription management
- **Email Service**: SendGrid for notifications

### Frontend Architecture
- **Component Library**: Custom components built on shadcn/ui foundation
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **Form Validation**: React Hook Form with Zod schemas
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animation**: Custom CSS animations for enhanced user experience

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect authentication with Replit
3. Session creation in PostgreSQL sessions table
4. User profile creation/update in users table
5. Role-based access control enforcement

### Contract Management Flow
1. Agent creates client record
2. Contract upload and parsing
3. AI analysis for risk assessment
4. Multiple signer workflow management
5. Automated monitoring and alert generation
6. Public records scanning for breach detection

### Property Research Flow
1. Address geocoding via Google Maps API
2. Parcel data retrieval from Regrid
3. Market data aggregation from multiple sources
4. AI-powered analysis and recommendations
5. Data storage for future reference

### Alert Generation Flow
1. Scheduled monitoring of contract expiration dates
2. Public records scanning for unauthorized transactions
3. AI analysis of market conditions affecting contracts
4. Alert creation and user notification
5. Alert management and resolution tracking

## External Dependencies

### Required APIs
- **Google Maps API**: For geocoding and location services
- **OpenAI API**: For AI-powered analysis and recommendations
- **Regrid API**: For property parcel and ownership data

### Optional APIs
- **MLS API**: Enhanced property listings and market data
- **Zillow API**: Additional property valuation data
- **Public Records APIs**: Comprehensive breach detection
- **SendGrid API**: Email notifications and alerts
- **Stripe API**: Payment processing and subscription management

### Infrastructure Dependencies
- **PostgreSQL Database**: Primary data storage
- **Replit Platform**: Hosting and deployment infrastructure
- **Node.js Runtime**: Server-side JavaScript execution

## Deployment Strategy

### Development Environment
- **Platform**: Replit development environment
- **Database**: Replit-managed PostgreSQL instance
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Port Configuration**: Frontend on 5000, mapped to external port 80

### Production Deployment
- **Target**: Replit autoscale deployment
- **Build Process**: Vite build for frontend, esbuild bundle for backend
- **Environment**: Production Node.js environment
- **Scaling**: Automatic scaling based on demand

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL adapter
- **Environment**: Database URL configuration via environment variables

### Environment Configuration
- **Development**: Local environment variables via .env
- **Production**: Replit environment variable management
- **Security**: API keys and secrets managed through secure environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 15, 2025**: Complete UI Button Connectivity and API Date Validation Fixes
  - Connected all 9 previously disconnected UI buttons across the application
  - Contract Monitoring: Fixed Take Action, View Details, and Configure buttons with proper navigation and feedback
  - Contracts Table: Connected View All button to navigate to contracts page
  - Prospecting: Fixed Generate Leads, Property Match, and Add to CRM buttons with appropriate actions
  - Resolved API date validation errors in showing, property visit, and commission protection endpoints
  - All date string inputs are now properly converted to Date objects before schema validation
  - Fixed showing creation functionality - users can now successfully schedule showings
  - Enhanced user experience with consistent button functionality and navigation patterns

- **June 15, 2025**: Enhanced Prospecting Dashboard with Real-Time Data
  - Connected prospecting stats cards to real database queries instead of static numbers
  - Active Prospects: Shows count of non-converted clients from client database
  - Conversion Rate: Calculates percentage of converted vs total clients
  - Follow-ups Due: Counts showings/meetings scheduled for today or overdue
  - Pipeline Value: Sums estimated commission values from protection records
  - Added dynamic styling with conditional colors and status indicators
  - Enhanced card hover effects and loading states for better user experience
  - Made all prospecting stats cards clickable with navigation functionality
  - Active Prospects/Conversion Rate → clients page, Follow-ups Due → showing tracker, Pipeline Value → commission tracker

- **June 15, 2025**: Dashboard Stats Cards Navigation Enhancement  
  - Made all dashboard stats cards clickable with smooth animations
  - Active Contracts → contracts page, Expiring Soon → filtered contracts view
  - Potential Breaches → alerts page, Protected Commission → commission tracker page
  - Created complete commission tracker page with summary stats and detailed records table
  - Added URL parameter filtering for contract expiration dates (?filter=expiring)
  - Fixed JavaScript initialization errors and improved data flow

- **June 15, 2025**: Legal Support Button Integration
  - Connected all legal support buttons throughout the application to redirect to centralized support page
  - Updated contract modal "Contact Legal Support" button to properly navigate to support page with legal tab
  - Added URL parameter handling to automatically open specific support tabs via navigation
  - Enhanced legal support page buttons (Attorney Consultation, Document Review, Dispute Assistance) with proper redirection
  - Maintained existing AI legal analysis functionality while centralizing human support access

- **June 15, 2025**: Comprehensive Support System Implementation
  - Created multi-tier support center with Legal, IT, and Real Estate support sections
  - Integrated Frontline Realty as exclusive partner for real estate consultation services
  - Added tabbed interface with overview, contact information, and specialized services
  - Connected support system to main navigation with proper routing
  - Implemented subscription management page with upgrade options and payment status tracking
  - Enhanced user dropdown menu with direct access to subscription and support features

- **June 15, 2025**: Admin Login System Implementation
  - Added comprehensive admin role-based access control system
  - Implemented admin dashboard for user management and oversight
  - Added user role management (agent, broker, admin) with proper middleware
  - Created admin-only routes for user status and subscription management
  - Enhanced user schema with role, license tracking, and activity status
  - Integrated admin dashboard into main application navigation at `/admin`

- **June 13, 2025**: Enhanced Nassau & Suffolk County Public Records Integration
  - Added comprehensive public records search APIs for both counties
  - Implemented multiple fallback data sources for reliable coverage
  - Created dedicated frontend interface for public records searches
  - Added API routes: `/api/public-records/nassau`, `/api/public-records/suffolk`, `/api/public-records/search`
  - Enhanced existing monitoring system with county-specific implementations

## Changelog

Changelog:
- June 13, 2025. Initial setup
- June 13, 2025. Nassau & Suffolk County public records integration completed