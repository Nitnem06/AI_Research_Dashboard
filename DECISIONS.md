# Engineering Decisions & Tradeoffs

## Why Next.js?

Next.js was selected for:
- fast frontend development
- App Router support
- optimized deployment on Vercel
- strong TypeScript ecosystem
- scalable routing structure

It also enabled rapid iteration during the assignment timeline.

---

## Why FastAPI?

FastAPI was chosen because of:
- async support
- high performance
- clean API design
- excellent developer experience
- strong compatibility with AI workflows

It fits AI backend orchestration particularly well.

---

## Why Supabase?

Supabase provided:
- managed backend infrastructure
- authentication support
- rapid development velocity
- simplified database management

This reduced infrastructure overhead and accelerated delivery.

---

## AI Orchestration Strategy

The project uses a modular orchestration approach.

### Goals
- provider flexibility
- reusable workflows
- clear separation between business logic and LLM logic

LiteLLM was used to simplify model integrations and improve extensibility.

---

## Multi-Tenant Strategy

Tenant-aware middleware was introduced to support:
- future SaaS extensibility
- cleaner data isolation
- scalable request handling

The architecture was intentionally designed to be extensible even within the internship scope.

---

## Deployment Decisions

### Frontend → Vercel
Chosen for:
- seamless Next.js integration
- fast CI/CD
- preview deployments

### Backend → Render
Chosen for:
- easy Docker deployment
- reliable Python hosting
- simplified environment management

---

## Tradeoffs & Constraints

Given the internship timeline, priority was placed on:
- architecture quality
- deployment stability
- modular design
- production readiness

Instead of:
- over-engineering features
- premature optimization
- excessive infrastructure complexity

---

## Challenges Solved

### Frontend Build Issues
- TypeScript path resolution
- deployment cache conflicts
- production build compatibility

### Backend Deployment Issues
- Python dependency conflicts
- AI package compatibility
- environment configuration

### Deployment Coordination
- frontend/backend environment synchronization
- CORS handling
- production branch management

---

## Future Improvements

If extended further, the platform could support:
- async background workers
- vector databases
- collaborative research
- real-time streaming
- advanced AI agents
- role-based organization access