Digital Library Frontend & Admin Interface

This repository serves as the administrative and user facing frontend for the Digital Library. Built with Next.js (App Router), the interface is designed as an archival workstation, prioritizing data density, typographic hierarchy, and system level feedback over decorative flair. It is the visual terminal through which the backend's Go powered architecture is curated.

Technology Stack
Framework: Next.js (App Router)

Styling: Tailwind CSS (Custom Blueprint Design System)

API Layer: Axios with Zod runtime validation

State Management: TanStack Query

Form Handling: React Hook Form

Utilities: Lucide React, Framer adjacent custom hooks (debounce, scroll, blur loading)

Architectural Design:
The frontend is built on three core pillars:

1. Defensive API Client: By centralizing networking in lib/api/client.ts, all incoming data is validated at runtime against Zod schemas. This ensures that even if the Go backend returns unexpected data, the frontend treats it with a fallback strategy rather than throwing runtime errors.

2. Blueprint Aesthetics: The design language utilizes a strict typographic system (Inter, JetBrains Mono, Newsreader) and a dark themed, blueprint inspired visual palette. This is reinforced through custom layout shells and transparent backdrop effects that distinguish operational (admin) areas from public (registry) areas.

3. Algorithmic UI: Instead of relying on rigid, third party masonry libraries, the MasonryGrid uses a custom height weight distribution algorithm. This allows for precise control over column balancing and layout rendering performance, ensuring the archive remains responsive regardless of image dimensions.

Key Modules
The Auth Engine
Authentication is handled through a specialized Context Hook pattern (useAuthInternal). This engine manages token persistence, window.storage event synchronization to detect multi tab logout, and error diagnostics that map standard API failures to system level status codes (e.g., ERR_INVALID_AUTH_TOKEN).

Post Management & Media
The editor system uses react hook form and zod to create a strict contract with the backend. Image processing is coupled with client side previews and memory safe URL.createObjectURL management to maintain smooth performance while handling binary data.

Registry System
The registry view uses debounced searching and custom smooth scrolling logic. By separating the RegistryRoot from RegistryItem, the interface maintains a modular hierarchy where complex data fetching logic remains decoupled from individual artifact rendering.

Core Features

1. Schema First Data Flow: Every API response is parsed through a Zod schema before hitting the state. This creates a type safe bridge between the Go backend structs and the React components.

2. Async Operational Feedback: The system uses optimistic UI patterns for actions like "liking" posts and provides granular feedback for long running processes (e.g., image uploads with progress callbacks).

3. Memory Integrity: Heavy use of useEffect cleanup functions (especially in the image preview and blur load hooks) prevents memory leaks a critical requirement for an application that handles high frequency image asset interaction.

4. Role Based Routing: The interface dynamically adapts based on the user's session role, gating administrative features like the Create and Edit pipelines directly at the layout level.

This project is a high performance backend for a digital library, built with Go. It focuses on clean architecture, separating HTTP concerns from business logic. The system is designed to handle artifacts, user authentication, and media processing efficiently.

The backend follows a layered architecture pattern:

1. Handlers: Manage HTTP routing, parameter extraction and JSON responses, they act as the boundary between the web client and the system logic.

2. Services: House the business logic. These are framework agnostic, meaning they do not import Ging. This makes the code highly testable and reusable.

3. Repositories: Handle direct database communication using PostgreSQL and pgx.

4. Domain: Defines the interfaces, ensuring loose coupling between layers.

The Image Service Refactor.
I recently completed a major refactor of the image handling pipeline. Previously, the service layer was tightly coupled to the Gin framework because it accepted a \*gin.Context to extract files.

I decoupled this by changin the ImageService.Save method signature to acceptan io.Reader and a filename string.

This change provides several advantages:

1. Framework Independence: The service layer no longer cares if it is being called by a Gin handler, a CLI tool or a background worker.

2. Improved Testability: I can now test the image saving logic by passing a bytes.Buffer containing dummy data, rather than mocking a complex HTTP context.

3. Memory Efficienct: By using io.Copy and streaming the file, the system avoids loading large images into memory.

Core Features

1. Automated Slug Normalization: Titles are converted to URL frinedly slugs using Unicode normalization.

2. Async Processing: BLurHash generation runs in a goroutine to keep API response times fast.

3. Transactional Integrity: Comples creation steps involving tags and database entreies are wrapped in transactions to prevent partial data states.

4. Security: Middleware handles JWT validation, and the service layer enforces role based access before database operations occur.

Technology Stack:
Language: Go

Web Framework: Gin

Database: PostgreSQL with pgx/v5

Authentication: JWT

Media Processing: BlurHash for visual placeholders

Security: Bcrypt for password hashing

Key Features:

Setup
Configure the environment variables:

Bash
NEXT_PUBLIC_API_URL=http://localhost:8080
Install dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Directory Structure
app/admin/: Administrative routes, layout, and control center logic.

app/upload/: Dedicated artifact ingestion interface.

components/: Modular UI components (Cards, Modals, Navigation).

hooks/: Business logic abstractions (Debounce, Storage, API wrappers).

lib/api/: The defensive network layer including client config and schemas.

types/: Shared TypeScript definitions matching the backend models.
