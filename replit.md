# Commission Guard - Real Estate Commission Protection Platform

## Overview

Commission Guard is a specialized real estate commission protection platform designed exclusively for agents and brokers to prevent commission breaches from client ghosting and unauthorized transactions. The application focuses specifically on protecting commissions when clients abandon their exclusive contracted agent and purchase with someone else. The system provides AI-powered contract analysis, comprehensive showing tracking with ShowingTime integration, and automated public records monitoring to detect and prevent commission breaches.

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

- **December 24, 2024**: Complete Deployment Fix for Production Platforms
  - Resolved REPLIT_DOMAINS environment variable dependency preventing deployments on Render/Vercel/Railway
  - Implemented conditional authentication system detecting Replit vs production environments automatically
  - Updated port configuration to use process.env.PORT for production platform compatibility
  - Removed duplicate methods causing build warnings (getAllUsers, getExpiringContracts)
  - Created complete file replacements for manual GitHub repository updates
  - Application now works seamlessly across all deployment platforms with automatic environment detection
  - Demo authentication mode ensures functionality without Replit-specific dependencies

- **June 17, 2025**: Frontend UI Audit and Non-Functional Button Fixes
  - Conducted comprehensive audit of frontend codebase identifying all non-functional buttons and dead links
  - Fixed Document Manager page critical issues: added onClick handlers to View, Download, Share, Edit, New Folder, and Choose Files buttons
  - All document action buttons now provide informative user feedback explaining API integration requirements
  - Property Research widget now properly navigates to Commission Intelligence dashboard as requested
  - All 8 dashboard widgets confirmed functional with proper navigation routing
  - Identified API-dependent features that will be completed once external APIs are integrated in 1-2 days
  - Enhanced user experience by ensuring all clickable elements provide appropriate feedback rather than appearing broken

- **June 17, 2025**: Commission Intelligence Dashboard Implementation
  - Replaced wasteful rental market page with comprehensive Commission Intelligence dashboard featuring AI-powered commission protection analysis
  - Created four specialized analysis tabs: Contract Analysis, Client Risk Assessment, Market Intelligence, and Protection Strategy
  - Contract Analysis: AI-powered contract review with risk assessment, commission term analysis, and protection strength evaluation
  - Client Risk Assessment: Behavior pattern analysis with risk scoring, monitoring recommendations, and client engagement metrics
  - Market Intelligence: Location-based market insights for competition analysis, commission risk evaluation, and market activity trends
  - Protection Strategy: Comprehensive protection recommendations including contract strengthening, monitoring protocols, timeline management, and red flag indicators
  - Added AI-powered insights banner with personalized portfolio analysis displaying contract expiration alerts, client activity patterns, and protection scores
  - Implemented corresponding API endpoints for all analysis functionality with proper error handling and fallback responses
  - Updated navigation from rental market to commission intelligence with Brain icon integration and proper routing
  - Enhanced app focus on core commission protection with advanced AI analytics capabilities replacing non-essential rental market features

- **June 17, 2025**: Enhanced Dashboard Animations with Dynamic Icon Effects
  - Integrated advanced animations to all 8 widget background icons with spinning, rotating, flipping, scaling effects
  - Added unique motion combinations: scale pulsing, 3D transformations, pendulum swings, continuous rotations
  - Enhanced visual appeal with complex animations including Y-axis flips, Z-axis spins, and alert shakes
  - Optimized animation timing with varying durations and repeat delays for natural movement patterns
  - Moved Real-Time Activity Stream above Portfolio Health sections for better information hierarchy
  - Fixed Potential Breaches button routing and maintained unified widget styling throughout dashboard
  - Created engaging, professional dashboard experience with dynamic visual elements and smooth transitions

- **June 16, 2025**: AI Support Chatbot Model Fix and Fallback System
  - Fixed AI chatbot functionality by updating all AI services to use GPT-3.5-turbo instead of GPT-4
  - Resolved model access errors that were preventing the AI support chat from responding to users
  - Updated aiSupportService.ts, aiService.ts, and aiCommunicationService.ts to use accessible OpenAI models
  - Implemented comprehensive fallback system for when OpenAI API quota is exceeded
  - AI chatbot now provides contextual responses based on keywords even without API access
  - Fallback responses cover contracts, clients, showings, commission protection, alerts, and general support
  - AI chatbot remains functional and helpful regardless of API availability or quota limitations

- **June 16, 2025**: Contract Reminders Integration into Contracts Tab
  - Successfully combined Contract Reminders functionality into the main Contracts page using tabbed navigation
  - Removed separate Contract Reminders navigation item to reduce interface complexity and improve efficiency
  - Created unified contract management experience with "Contracts" and "Contract Reminders" tabs
  - Enhanced user workflow by consolidating all contract-related features in one location
  - Maintained full reminder functionality including setup automation, processing controls, and detailed statistics
  - Fixed React hooks ordering issues to ensure stable component rendering
  - Updated navigation menu to streamline user experience while preserving all existing features

- **June 16, 2025**: Automated Contract Reminder System Implementation
  - Created comprehensive automated reminder system for weekly client check-ins and contract expiration warnings
  - Built ContractReminder table with notification types, scheduling, and recurring reminder capabilities
  - Added Contract Reminders page accessible through main navigation for agent reminder management
  - Implemented setup automation that creates weekly check-ins (every 7 days) and expiration warnings (30-day and 7-day alerts)
  - Enhanced database storage methods and API endpoints for complete reminder lifecycle management
  - Created user-friendly interface with reminder statistics, processing controls, and detailed scheduling overview
  - Added notification methods supporting email, SMS, and combined delivery options with priority levels
  - System enables agents to maintain consistent client contact and prevent contract lapses through automated alerts

- **June 16, 2025**: Enhanced Admin Interface Implementation
  - Created comprehensive enhanced admin dashboard with tabbed interface (Overview, User Management, Analytics, System Health)
  - Added system analytics displaying real-time user statistics, contract counts, and platform metrics
  - Implemented advanced user management with search, filtering, role changes, and subscription management
  - Built admin-specific API endpoints for system statistics and platform oversight
  - Added user activity tracking, subscription analytics, and system health monitoring
  - Enhanced admin dashboard accessible at `/admin-enhanced` route with full platform management capabilities
  - Integrated comprehensive admin functionality including user role management, subscription updates, and system monitoring
  - Created detailed analytics showing user growth, role distribution, revenue metrics, and platform usage statistics

- **June 16, 2025**: App Refocused on Commission Protection and Breach Prevention
  - Removed prospecting functionality to specialize exclusively on commission protection
  - Streamlined navigation to focus on core breach prevention features
  - Updated app description to emphasize protection from client ghosting and unauthorized transactions
  - Consolidated navigation menu with commission-focused features only
  - Maintained essential features: clients, contracts, showing tracker, commission protection, alerts, public records monitoring
  - Enhanced system focus on detecting when clients abandon exclusive agents and buy with competitors
  - Unified Showing Tracker now includes integrated ShowingTime functionality for comprehensive tracking

- **June 16, 2025**: Unified Showing Tracker with ShowingTime Integration
  - Successfully consolidated ShowingTime functionality into the main Showing Tracker interface
  - Created unified experience combining manual showing scheduling with ShowingTime automation
  - Added "ShowingTime Import" tab within Showing Tracker for seamless workflow integration
  - Implemented comprehensive connection status monitoring with clear setup instructions
  - Built selective and bulk appointment import capabilities directly in the tracker interface
  - Enhanced user experience with single-location management for all showing activities
  - Removed separate ShowingTime navigation item to reduce interface complexity
  - Maintained all existing ShowingTime API functionality within consolidated interface
  - System provides step-by-step API credential setup guidance for users
  - Complete ShowingTime integration now accessible through unified Showing Tracker dashboard

- **June 15, 2025**: Twilio SMS Integration with Intelligent Response Routing
  - Successfully integrated Twilio SMS service for automated showing reminders
  - Implemented 24-hour and 1-hour advance notifications for scheduled showings
  - Created comprehensive SMS message tracking system with database storage
  - Built intelligent response routing that identifies which agent a client belongs to
  - Added Twilio webhook endpoint to capture and process incoming SMS responses
  - Implemented AI-powered analysis of client SMS responses for context understanding
  - Created bidirectional SMS communication with proper agent-client relationship tracking
  - Added SMS conversation history API for viewing client communication threads
  - Integrated auto-reply functionality for common client responses
  - System requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables

- **June 15, 2025**: Complete Showing Tracker with Automated Missed Showing Detection
  - Successfully fixed showing creation - agents can now schedule showings with datetime picker
  - Implemented automated showing status tracking that detects missed appointments after 2 hours
  - Added "Track Route" button to mark showings as completed and create property visit records
  - Added "Mark Missed" button for manual marking of no-show appointments
  - Automated property visit creation for both completed and missed showings
  - Auto-detection creates high-risk property visits for missed showings requiring follow-up
  - Enhanced showing table with dynamic action buttons based on status (scheduled/completed/missed)
  - Fixed all API date validation issues across showing, property visit, and commission protection endpoints
  - Connected all 9 previously disconnected UI buttons across the application
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