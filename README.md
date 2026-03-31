`The Digital Archive`: Full Stack Engineering Showcase

A high performance, production ready digital library ecosystem. This project demonstrates a transition from a standard `MVC` to a `Domain Driven Onion Architecture` in Go, paired with a modern Next.js 16 frontend that prioritizes type safety, memory efficiency, and strict Zod contract synchronization.

Architectural Engineering Highlights.

1. Domain Driven Onion Architecture (New):
   Migrated the entire backend to a decoupled Service Interface architecture. By defining core logic in a central domain layer, the business rules remain independent of the database (PostgreSQL) and the transport layer (Echo/Gin).

   Impact: Facilitated 100% unit test coverage via dependency injection and mock repositories

   Context Safety: Implemented full `context.Context` propagation from the HTTP handoff down to the SQL driver, ensuring zero orphaned database processes.

2. linear Time Recursive Comment Trees:
   Developed a pointerstable, 3 pass map algorithm to transform flat SQL result sets into deeply nested JSON comment threads.

   Performance: Reduced complexity from $O(n^2)$ (recursive lookups) to $O(n)$ (linear hash map).

   Impact: Avoided expensive Recursive CTEs in SQL, handling the heavy lifting in Go's memory efficient heap.

3. High Performance Slug Engine (GO):
   Replaced expensive regex heavy logic with a manual single pass `strings.Builder` implementation.

   Security: Integrated blueMonday for UGC (User Generated Content) sanitization and Bcrypt for truncation-safe password hashing.

4. Next.js 16 & React 19 Integration (The "Bleeding Edge")
   One of the first implementations of the Next.js 16 App Router paired with React 19.

   Hydration Resillience: Custom `useAuth` hooks utilize a Mounted State pattern to prevent SSR mismatch when accessing `localstorage`.

   Contract First Validation: Every API response is piped through `Zod Schemas` at the network boundary, ensuring the frontend never attempts to render corrupt or incomplete data.

Tech Stack.

Backend: Go (1.22+).
   Framework: Echo / Gin (Optimized with custom JSON binding).

   Architecture: Domain-Driven Design (DDD) with Repository Pattern.

   Security: JWT v5, BlueMonday, Bcrypt, Token Bucket Rate Limiting. 

Frontend: Next.Js (16) & React 19.
   Core: App Router, Server Components, and Custom Hooks.

   State/Validation: TanStack Query & Zod.

   UI/UX: Tailwind CSS v4, Framer Motion, Lucide Icons.

   Media: Custom Image Fallback system with BlurHash support.

Roadmap & Progress
[Phase 1] Core Synchronization (Completed)
- [x] Context Hardening: Full context propagation for request lifecycle management.
- [x] Domain Refactor: Decoupled Handlers, Services, and Repositories via interfaces.
- [x] Repository Layer: Refactored PostRepository for zero-pointer string scanning.
- [x] API Wrapper: Standardized `utils.Response` for consistent Data/Meta/Error structures.

[Phase 2] Frontend Intelligence (In Progress)
- [x] Zod Integration: Runtime validation for all archival endpoints.
- [x] Auth Persistence: Automated `Authorization: Bearer` injection via interceptors.
- [x] Optimistic UI: Transition Like/Comment mutations to TanStack Query.

[Phase 3] Advanced Visualization (Upcoming)
- [ ] The Spatial Archive: A 3D "Vault" view using React Three Fiber.
- [ ] Real time Sync: WebSockets for live comment thread updates.

Installation & Setup
1. Backend
cp .env.example .env 

psql -d digital_library -f scripts/seed.sql
go run cmd/api/main.go

2. Frontend
cd frontend 
npm install
npm run dev

Dev Note: The "Turbopack Panic" Resolution
   During development on React 19, a low level Rust panic was identified in the Turbopack build engine. This was resolved by:

   Reverting to the stable Webpack based dev server (next dev).

   Clearing corrupted task aggregation caches (rm -rf .next).

   Configuring next.config.ts to allow upstream images from private local IPs.