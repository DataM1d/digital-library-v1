Digital Library API (v3)

 A clean, production ready Go backend for a curated digital archive. This project implements a high performance discovery engine with a focus on Gin Gonic efficiency, relational integrity and developer experience.

 System Architecture:
 The system follows a strict unidirectional data flow:
 `Handler (HTTP) -> Service (Logic) -> Repository (SQL).`  

 This ensures that business rules like slug geneeration, NULL safety checks or permission assertions are never bypassed and remain easily testable.

Recent Updates: The Gin & SQL Refactor:
 Gin Gonic Migration: Switched from Chi to Gin for high performance routing, better middleware grouping and native JSON binding.

 Null Safe Scanning: Implemented `COALESCE` in the Repository layer to prevent GO `Scan` panics when encountering optional database fields.

 Strict Relational Integrity: Updated schema with `NOT NULL` constraints and `RESTART IDENTITY` logic for clean testing environments.

 Social & Discovery: Automates SEO Friendly slug generation and a standardized Like/Unlike system.

Tech Stack
   Language: GO 1.21+
   Router: Gin Gonic
   Database: PostgreSQL
   Auth: JWT & Bcrypt
   Security: Bluemonday (HTML Sanitization) & Rate Limiting
   Infrastructure: Docker & Docker Compose

Architecture & Design 
   cmd/api/: Entry point for server initialization and graceful shutdown logic.

   internal/handlers/: HTTP transport layer; parses JSON and handles status codes.

   internal/service/: The "Brain" of the app; handles complex logic like recursive comment nesting and slug uniqueness.

   internal/repository/: Pure SQL layer; utilizes pg for performance and relational integrity.

   pkg/: Shared utilities (JWT management, password hashing, slug engines).


Key Engineering Decisions
   The COALESCE Strategy: 
   To solve the `Scan NULL into int` error, all optional fields (like category_id or last_modified_by) use SQL COALESCE to provide safe defaults (e.g., ID 1) during retrieval.

   Context Based Auth: Middleware extracts User IDs from JWTs and injects them into the Gin context, allowing handlers to perform Role Based Access Control (RBAC) seamlessly.
   
   Atomic Transactions: Post creation uses `db.Begin()` to ensure the Post, Tags, and Categories are committed as a single unit no partial data corruption.
   
   Seed Control: Included a specialized seed.sql that uses TRUNCATE ... RESTART IDENTITY to ensure consistent IDs (1, 2, 3...) during development.

API Endpoints
   Authentication:
| Method | Endpoint | Description | Access |
| POST | `/register` | Create a new account | Public |
| POST | `/login` | Get a JWT token | Public |

   Discovery 
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/posts` | List posts (Search, Category, Tag filters) | Public |
| GET | `/posts/s/{slug}`| Fetch a single post by clean URL | Public |
| GET | `/posts/{id}/comments` | View the social feed for a post | Public |

   Interaction
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/upload` | Secure image upload with BlurHash gen | User |
| POST | `/posts` | Create a new entry | Admin |
| POST | `/posts/{id}/like` | Toggle Like/Unlike status | User |
| POST | `/posts/{id}/comments`| Post a new comment | User |

Quick Start
   Clone & Setup:
   git clone https://github.com/YourUsername/digital-library.git
   cd digital-library
   cp .env.example .env

Database Seeding:
Execute scripts/seed.sql to populate the library with 50 sample entries and a default admin user.

Launch:
   docker-compose up --build

The Gin server will be available at http://localhost:8080.