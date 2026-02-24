Digital Library API

A clean production ready Go backend for a curated digital archive. This project follows a tiered architecture 
(Handler -> Service -> Repository) and features role based access control, JWT authentication, and advanced SQL filtering.

Quick Start (Docker)

1. Clone the repository:
   git clone https://github.com/YourUsername/digital-library.git
   cd digital-library

2. Setup enviroment variables:
   Create a .env file in the root:
   DB_USER=user
   DB_PASSWORD=pass
   DB_NAME=digital_library
   DB_HOST=db
   DB_PORT=5432
   JWT_SECRET=your_super_secret_key

3. Run with one command:
   docker-compose up --build

Architecture & Design

This project implements the Clean Architecture pattern to ensure separation of concerns:

  Cmd: Entry point of the application.

  Internal/Handlers: HTTP logic and request parsing.

  Internal/Services: Business logic and permission checks (e.g., Admin-only posts).

  Internal/Repositories: Database specific SQL queries.

  Pkg: Reusable utilities (JWT, Bcrypt, DB connection).

Engineering Decisions

  Chi Router: Chosen for its lightweight footprint and idiomatic middleware support.

  PostgreSQL: Utilized for its robust support of relational integrity and advanced querying (ILIKE, Subqueries)

  Manual Transactions: Implemented db.Begin() to ensure tag associations never leave "orphaned" data if a post fails to save.
  
Features 

  Auth: JWT based authentication with Bcrypt password hashing.

  RBAC: Role based access control (Admin vs. User).

  Relational DB: Many to Many relationships for Tags using a join table.

  ACID: Atomic transactions for post creation.

  Search: Case insensitive keyword search using PostgreSQL ILIKE.

  Pagination: Limit/Offset pagination for high performance data retrieval.

API Endpoints
  
  POST	/register |	Create a new account |	Public

  POST	/login |	Get a JWT token	 | Public

  GET	  /posts | List posts (supports search, page, limit) |	User

  POST	/posts | Create a new entry	 | Admin

  POST  /posts/{id}/like | Toggle like/unlike | User
  
Core Table Overview

- users (id, email, password_hash, role)
- posts (id, title, content, category_id, created_at)
- categories (id, name, slug)
- tags (id, name)
- post_tags (post_id, tag_id)
- likes (user_id, post_id)
