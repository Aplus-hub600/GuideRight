# GuideRight - Tactical Intelligence Assistant

## Overview

GuideRight is a multimodal LLM-powered tactical intelligence assistant designed for USSOCOM operations. The application provides real-time intelligence analysis, risk assessment, and situational awareness through an integrated mapping interface. It combines chat-based queries, file analysis, PMESII (Political, Military, Economic, Social, Information, Infrastructure) intelligence frameworks, and confidence scoring using Dempster-Shafer theory for multi-source data fusion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom tactical theme supporting dark/light modes
- **State Management**: TanStack Query for server state and React hooks for local state
- **Internationalization**: i18next for multi-language support (English, Spanish, French, Arabic)
- **Mapping**: Dual mapping system supporting both Google Maps API and Leaflet with OpenStreetMap fallback
- **Speech Integration**: Web Speech API for voice input/output with graceful degradation

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Type Safety**: TypeScript throughout with Zod schema validation
- **File Processing**: Multer for multipart uploads with support for images, videos, and documents
- **AI Integration**: OpenAI GPT integration with fallback mock responses for development
- **Storage Strategy**: In-memory storage implementation with interface for future database integration

### Intelligence Analysis Framework
- **PMESII Analysis**: Six-factor intelligence breakdown (Political, Military, Economic, Social, Information, Infrastructure)
- **Risk Scoring**: Automated risk assessment with categorical scoring (LOW/MEDIUM/HIGH/CRITICAL)
- **Confidence Modeling**: Dempster-Shafer theory implementation for multi-source confidence aggregation
- **Multimodal Processing**: Text, image, and video analysis with metadata extraction

### Data Architecture
- **Schema Design**: Drizzle ORM with PostgreSQL schema definitions
- **Data Models**: Users, chat messages, analysis results, and risk assessments
- **File Storage**: Memory-based file handling with structured metadata storage
- **Mock Data Sources**: Simulated intelligence feeds (Fraym, Seerist, Sprinklr, News, Social, Weather, Infrastructure)

### User Interface Design
- **Design System**: Military/tactical interface aesthetic with professional color schemes
- **Responsive Layout**: Sidebar navigation with resizable panels for multi-pane intelligence view
- **Interactive Components**: Drag-and-drop file upload, voice controls, real-time chat interface
- **Accessibility**: ARIA compliance and keyboard navigation support

### Tactical UX Features
- **Mission Clock**: Real-time Zulu (UTC) time, local time, and date display with LIVE indicator for ops coordination
- **Data Freshness**: Intel age tracking with color-coded indicators (green=fresh <1m, yellow=stale <5m, red=old >5m)
- **Risk Visualization**: Prominent threat level display with HIGH RISK (red, animated), ELEVATED (amber), LOW (green)
- **Quick Actions**: PMESII, Threats, SITREP, Infra, HUMINT tactical queries with keyboard shortcuts (Alt+1-5)
- **Keyboard Navigation**: Alt+1-5 for quick actions, Escape to clear input, optimized for fast-paced field environments
- **Population Density Grid**: 40x40 deterministic grid with click-to-sample functionality for population analysis

### Security & Performance
- **Environment Configuration**: Secure API key management through environment variables
- **Error Handling**: Comprehensive error boundaries with user-friendly fallbacks
- **Performance Optimization**: Lazy loading, query caching, and optimized bundle splitting
- **Development Tools**: Hot reload, error overlays, and comprehensive logging

## External Dependencies

### Required APIs
- **OpenAI API**: GPT-4/5 integration for tactical analysis and chat responses
- **Google Maps API**: Primary mapping service with satellite imagery and route planning

### Optional Services
- **Mapbox**: Alternative mapping provider with enhanced visualization capabilities
- **Translation Services**: LibreTranslate or similar for real-time language translation

### Development Dependencies
- **Neon Database**: Serverless PostgreSQL for production data persistence
- **Replit Integration**: Development environment optimizations and error handling
- **Build Tools**: esbuild for server bundling, Vite for client bundling

### Third-party Libraries
- **UI Components**: Radix UI primitives for accessible component foundation
- **Mapping Libraries**: Leaflet for open-source mapping, react-leaflet for React integration
- **File Processing**: Mammoth for document parsing, react-dropzone for file uploads
- **Utility Libraries**: date-fns for date manipulation, clsx for conditional styling