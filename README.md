`The Digital Archive`: Full Stack Engineering Showcase

A high performance, production ready digital library ecosystem. This project demonstrates a transition from a standard `MVC` to a `Domain Driven Onion Architecture` in Go, paired with a modern Next.js 15+ frontend that prioritizes type safety, memory efficiency, and sub 100ms response times.


Architectural Engineering Highlights.

1. Domain Driven Onion Architecture (New):
   Migrated the entire backend to a decoupled `Service Interface architecture`. By defining core logic in a central `domain` layer, the business rules remain independent of the database (Postgres) and the transport layer (Gin).

   Impact: Facilitated 100% unit test coverage via dependency injection and mock repositories

   Context Safety: Implemented full `context.Context` propagation from the HTTP handoff down to the SQL driver, ensuring zero orphaned database processes.

2. linear Time Recursive Comment Trees:
   Developed a pointerstable, 3 pass map algorithm to transform flat SQL result sets into deeply nested JSON comment threads.

   Performance: Reduced complexity from $O(n^2)$ (recursive lookups) to $O(n)$ (linear hash map).

   Impact: Avoided expensive Recursive CTEs in SQL, handling the heavy lifting in Go's memory efficient heap.

3. High Performance Slug Engine (GO):
   Replaced expensive regex heavy logic with a manual single pass `strings.Builder` implementation.

   Security: Prevents memory leaks by automatically pruning state IP tracking entries after a specified TTL without the overhead of Redis for single node deployments.



Tech Stack.

Backend: Go (1.22+).
FrameWork: Gin Gonic (omptimized with custom JSON binding)
Architecture: Domain Driven Design (DDD) with Repository Pattern.
Security: JWT v5, blueMonday (UGC sanitization), Bcrypt (truncation safe).

Frontend: Nect.Js (15+).
Core: App Router, Server Actions, and Custom Hooks.
State/Validation: TanStack Query & Zod.
UI/UX: Tailwind CSS, Framer Motion, Lucide.
Media: Custom Image Fallback system with BlurHash support.

Roadmap & Progress
[Phase 1] Core Synchronization (Completed)
- [x] Context Hardening: Full context propagation for request lifecycle management.
- [x] Domain Refactor: Decoupled Handlers, Services, and Repositories via interfaces.
- [x] Repository Layer: Refactored PostRepository for zero-pointer string scanning.
- [x] API Wrapper: Standardized `utils.Response` for consistent Data/Meta/Error structures.

[Phase 2] Frontend Intelligence (In Progress)
- [x] Zod Integration: Runtime validation for all archival endpoints.
- [ ] Auth Persistence: Automated `Authorization: Bearer` injection via interceptors.
- [ ] Optimistic UI: Transition Like/Comment mutations to TanStack Query.

[Phase 3] Advanced Visualization (Upcoming)
- [ ] The Spatial Archive: A 3D "Vault" view using React Three Fiber.
- [ ] Real time Sync: WebSockets for live comment thread updates.

Installation & Setup
1. Backend
cp .env.example .env 

psql -d digital_library -f scripts/seed.sql
go run cmd/api/main.go

2. Frontend
cd frontend && npm install && npm run dev