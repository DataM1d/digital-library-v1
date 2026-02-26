Digital Library API (v2)

A clean production ready Go backend for a curated digital archive. This project implements a high performance discovery engine with a focus on clean architecture, relational integrity, and developer experience.

(Handler -> Service -> Repository) and features role based access control, JWT authentication, and advanced SQL filtering.

Recent Updates: The Social & Discovery Layer
   Slug Engine: Automated SEO friendly URL generation with built in collision resolution.
   Public Discovery: Opern routes for browsing, searching and filtering without authentication.
   Relational Comments: Fully integrated social layer with `ON DELETE CASCADE` integrity.

Tech Stack
   Language: GO 1.21+
   Router: Chi (Lightweight & Idiomatic)
   Database: PostgreSQL
   Auth: JWT & Bcrypt
   Infrastructure: Docker & Docker Compose

Architecture & Design 
   This project follows a Tiered Architecture to ensure separation of concerns:
      Cmd: Entry point for server initialization.
      Internal/Handlers: HTTP request/response parsing and validation.
      Internal/Services: The brain: Business logic, permission checks, and slug generation.
      Pkg: Shared utilities (JWT, Slugs, Password Hashing).

Key Engineering Decisions
   Collision Resistant Slugs: Implemented a recursive check in the Service layer to ensure unique URL paths (e.g, `modern-art` -> `modern-art-1`).
   Atomic Transactions: Used `db.Begin()` for post creation to ensure Post Tag relationships are created as a single unit of work.
   Context Key Safety: Utilized custom types for Context keys to prevent collision and ensure type safe middleware assertions.
   SQL Optimization: Used `COALESCE` and `Subqueries` to handle nullable joins and performance heavy counts directly in the DB.

API Endpoints
   Authentication:
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Create a new account | Public |
| POST | `/login` | Get a JWT token | Public |

   Discovery 
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/posts` | List posts (Search, Category, Tag filters) | Public |
| GET | `/posts/{id}` | Fetch a single post by ID | Public |
| GET | `/posts/s/{slug}`| Fetch a single post by clean URL | Public |
| GET | `/posts/{id}/comments` | View the social feed for a post | Public |

   Interaction
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/posts` | Create a new entry | Admin Only |
| POST | `/posts/{id}/like` | Toggle Like/Unlike status | User |
| POST | `/posts/{id}/comments`| Post a new comment | User |

Database Schema
   The system uses a highly relational schema to minimize data redundancy:
      `users`: Identity and Role Based Access Control.
      `posts`: Content storage with `image_url` and `blur_hash`.
      `post_tags` & `tags`: Many to Many bridge for flexible categorization.
      `comments`: Relational social data linked to users and posts.
      `likes`: Unique constraint backed interaction tracking.

Quick Start
   Clone & Setup:
   git clone [https://github.com/YourUsername/digital-library.git](https://github.com/YourUsername/digital-library.git)
   cp .env.example .env # Update your DB credentials and JWT_SECRET

Launch:
   docker-compose up --build
