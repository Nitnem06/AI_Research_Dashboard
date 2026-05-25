# System Architecture

## High-Level Architecture

```text
Frontend (Next.js)
        ↓
FastAPI Backend
        ↓
AI Orchestration Layer
        ↓
Supabase Database & Auth
```

---

## Frontend Architecture

The frontend is built using Next.js App Router with TypeScript.

### Responsibilities
- Authentication flows
- Dashboard rendering
- Research interaction workflows
- Report visualization
- API communication

### Key Design Choices
- Modular component structure
- Typed API interactions
- Route-based organization
- Client-side state handling

---

## Backend Architecture

The backend is built using FastAPI with a modular service-oriented structure.

### Core Responsibilities
- API handling
- AI orchestration
- Authentication validation
- Tenant-aware request handling
- Research workflow execution

### Key Modules

#### API Routers
Handles:
- authentication
- research endpoints
- report operations

#### Middleware
Responsible for:
- tenant isolation
- request validation
- CORS handling

#### AI Service Layer
Handles:
- LLM orchestration
- prompt execution
- response generation
- research pipelines

---

## AI Orchestration Flow

```text
User Query
    ↓
Research Endpoint
    ↓
AI Service Layer
    ↓
LLM Processing
    ↓
Structured Report Generation
    ↓
Frontend Rendering
```

### Design Goals
- Modular orchestration
- Easy provider replacement
- Scalable AI workflows
- Clear separation of concerns

---

## Multi-Tenant Design

Tenant isolation is handled at the middleware and API layer.

### Approach
- Tenant-aware request processing
- Scoped data access
- Extensible organization support

### Benefits
- Better scalability
- SaaS-ready architecture
- Cleaner access boundaries

---

## Deployment Architecture

### Frontend
- Platform: Vercel
- Framework: Next.js

### Backend
- Platform: Render
- Runtime: Dockerized FastAPI service

### Database
- Platform: Supabase

---

## Security Considerations

- Environment variable isolation
- Protected API routes
- CORS configuration
- Authentication middleware
- Secret management

---

## Scalability Considerations

The architecture was designed to support:
- additional AI providers
- async task queues
- vector search systems
- multi-organization scaling
- report persistence expansion