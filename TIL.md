VERSION 1 

Phase 1: The Foundation 2026-02-19

1. Project initialization & Go Modules
    What: Ran go mod init github.com/DataM1d/digital-library.

    Why: Unlike JavaScript which uses npm and package.json, Go uses Modules. This file tracks your dependencies and defines the 'import path' for your internal packages.

    Lesson: Dont run this in your User Home directory! It must be in a dedicated project folder so Go knows exactly where the project boundaries are.

2. Standard Go Project Layout
    What: Created folders like /cmd, /internal, and /pkg.
    
    Why: Go is very flexible,  but the community follows a 'Standard Layout'.
    
    cmd/: Entry points the main.go that starts the app.

    internal/: Private code. Other people's projects can't import this. This is where the 'meat of the app (Business logic, DB queries) lives.

    pkg/: Public/Helper code, Logic that could be reused elswhere (like DB connection setup).

    React Comparison: This is like separating src/components, src/hooks and src/services

3. Containerization with Docker
    What: Configured docker-compose.yml for PostgreSQL and Adminer.

    Why: *Isolation: Avoids cluttering the local OS with database installations.
    
    Parity: Ensures the database version (Postgres 15-alpine) is identical for everyone working on the project.
    
    Adminer: I added a GUI to 'see' the data without needing to master complex CLI commnads on day one

4. Data Modeling (Structs vs SQL)

    What: Defined Post and User as Go Structs and as SQL Tables 

    Why: in a typed backend, you need 'Two Worlds'
        The Database World: Tables, Rows and Foreign Keys(SQL).
        The Application World: Objects/Structs that Go can manipulate.

    Note: Use Struct Tags (e.g `json:'title'`) to fix Go's naming convetions (PascalCase) and JSON's convetions (camelCase/snake_case).


5. Database Connectivity in Go
    sql.Open vs Ping(): Open initializes the driver/pool, while Ping verifies the actual connection.

    Blank Imports (_): Used to register database drivers without calling them directly.

    Connection Pooling: Go’s sql.DB isn't a single connection; it’s a pool that automatically manages multiple connections for performance.

    DSN: The "Address" of the database, formatted as a connection string.

Phase 1: 2026-02-20
    
    Creating main.go file, that acts as the 'Manager' that starts the whole operation.

1. Docker failed due to CPU architecture (intel vs Apple Silicon) and
    macOS security (Quarantine flags)
                                
    Lesson: Infrastructure is secondary to Development. The fix: I pivoted to Postgres.app
    
    Why:  As a junior my goal is to learn Go. Fighting Docker for 3 days is a distraction. Using a native app (Postgres.app) or Homebrew provides the same database service but with 90% less 'friction'

2. Homebrew failed because of "Command Line Tools" 
    (CLT mismatch).
    
    Lesson: macOs isn't just a GUI; It's a Unix system. Most dev tools (Go, Brew, Postgres) rely on C compilers (Clang/GCC) hidden in the background. If those 'tools of the trade' are broken everything else chain reacts and fails.

3. The Go & Postgress Connection (the 'DSN' myster)
    I encountered a 'FATAL: unrecognized configuration parameter' error. This was a masterclass in how Go communicates with databases.
    
    The DSN (Data Source Name): This is a URL. Just like 'https://google.com', it has a protocol (postgres://), credentials (user:password), and a destination(localhost:5432).
    
    Typo Sensitivity: In the browser, if you type google.com/, it works. in a DSN, if you type sslomde instead of sslmode, the database driver crashes.
    
    Lesson: Backend code is unforgiving. Must be precise because there is no 'browser' to intelligently guess what you meant.

4. Database/sql vs pgx Relationships
    database/sql: This is built into Go: it's an interface. It know how to talk to any SQL database, but it does not know the 'lkanguage' of Postgres specifically.
    
    pgx: This is the Driver. It's the translator that speaks Postgres.
    
    The blank import: I used _'github.com/jackc/pgx/v5/stdlib'.

    Why: pgx functions are not called direcly. They are called with standard sql functions. The underscore tells Go: 'Hey, run the code inside pgx so it registers itself as a driver, then leave it alone'.
    
Phase 1: 2026-02-21

1. The Repository pattern
    Concept: I learned not to put SQL queries directly in the main logic. Instead, i created a repository layer.

    Why: This keeps the code clean. If i ever change my database, i only have to change one file, not the whole app.

2. Go Structs & JSON Mapping
    Learning: Used struct tags like JSON:"title" to tell Go how to format data for the web.

    Discovery: Go uses Capitalized names for internal logic, but the web usually expects lowercase. Tags bridge the gap.

3. The internal server error (500) vs (404)
    The Struggle: Encountered a 404 which taught me about Chi Router path matching.

    The Hurdles: Then hit a 500 error, which led to a deep dive into the database terminal.

    Lesson: I learned that 500 error often means the Handshake between Go and Postgres is broken (missing tables or column mismatches).

4. Postgres Terminal Mastery
    Succes: Manually created the posts table using SQL in the terminal.

    Key Command: Learned \d posts to verify that my table structure matches my Go modules.Post struct.

5. Dependency injection
    Wiring: I sucessfully wired the application: Database -> Repository -> Handler -> Router.

    The big win: Successfully established the Full Request Lifecycle.

    Browser asks for /posts -> Chi Router finds the path -> PostHandler calls the Repo -> PostRepository queries Postgres -> Postgres returns rows -> Go serializes it to JSON -> Browser displays data.

    Dynamic vs Static: Proved the API is dynamic by inserting data via the Postgres CLI and seeing it update in the browser without changing a single line of Go code.

    
Phase 2: Security & Identity 2026-02-22

1. Password zero trust policy
    Concept: Implemented the industry standard rule: Never store plain text passwords.

    Tool: Integrated golang.org/x/crypto/bcrypt.

    Technicality: Learned that Bcrypt handles salting automatically. A salt is a random string added to the password before hashing so that two users with the same password ('password1234') end up with two completly different looking hashes in the database.

2. User schema design (Postgres)
    Unique Constraints: Applied the UNIQUE constraints to the email column in the users table. This offloads the ('Does this user already exist?')
    check to the database level, which is faster and more reliable than checking it in Go code.

    Role based foundation: Added a role column (defaulting to 'user') to prepare for the Admin only features. 

3. Model mapping & JSON secuity
    The hyphen tag(json:"-"): Discovered the power of the hyphen tag in Go. By marking the PasswordHash field with json:"-", i have ensured that the hash stays on the server and is never leaked to the frontend, even if the whole User object os encoded to JSON/

    Clean separation: Created a dedicated User struct in /internal/models to match the new database schema.

4. Reusable utilities(/pkg)
    Logic vs Tooling: Placed the Bcrypt wrapper functions in /pkg/utils.

    Reasoning: Password hashing is a tool. By putting it in pkg, i am signaling that this code is a standalone helper that does not need to know anything about my specific Library business logic.

5. User related database operations
    internal/repository/user_repo.go: Handlers should not know how to write SQL. By moving the INSERT and SELECT queries into a Repository, the code stays modular.

    Scan & return: I learned how to use RET
    URNING id, created_at in Postgres. This allows Go to immediately populate the User struct with the database generated ID and timestamp without making a second query.
    
    Lesson: Using QueryRow is more efficient than Query when you only expect one result (like a single user or a new ID). It handles the row closing for you, which reduces the chance of memory leaks.

6. Registrtion Success 
    What: Successfully implemented a /register endpoint that accepts JSON,hashes passwords, and  saves users to PostgresSQL.

    The Evidence: Using postman, i received HTTP 201 created with a clean JSON response (no password leaked)

    Database: Verified the record exists with a $2a$14$ prefix, indicating a bcrypt algorithm with a cost factor of 14.

    Lesson: The json:"-" tag in the Go model is the MVP here. It allowed me to use the models.User struct to save the hash to the DB, but automatically stripped it out when sending the response back to the client.

7. Login & JWT
    Concept: Implemented the Login flow. Unlike registration, which creates data, login verifies data and issues a temporary pass.

    Status Code: Successfully received 200 OK from Postman on the /login route.

8. JWT Mastery
    What is it: JWT is a stateless way to track users. The server does not have to remember session. It just trusts the token because it was signed with a Secret key.

    Payload: I learned how to embed custom data inside the token. My tokens now carry the user_id and the role (Admin/User)

    JWT.io Discovery: Pasting the token into jwt.io allows me to see the encoded data. It's a reminder that JWTs are not encrypted, only signed. Anyone can read the data, but no one can change it without the secret key.


Phase 3: The Library Logic 2026-02-23

1. Categories & Tags
    Key concept, Many to many relationships: I learned that to link Posts and Tags without duplicating data, i need a Join table(post_tags). This table does not have its own content. It just holds the IDs of the two thing it is connecting.

    Service Layer: I am moving logic out of the Handler. Now the Handler just hears the request, and the service decides if it is allowed.

2. One to many relational
    Categories: Every post belongs to exactly one category (e.g, "Synth", "Kung Fu").

    Tags: A post can have multiple labels (e.g, "Vintage", "70s", "Vibe").

3. The join table
    post_tags: I learned that you can not put a "list" of tags inside a single column in a standard SQL table. Instead, i created bridge table that stores pairs of post_id and tag_id.

    Lesson: Many to many relationships require three labels. The two entities and the join table that connects them.

4. Service layer pattern
    Concept: Introduced a new layer between the Handler and the Repository. internal/service.

    Why: Handlers should only care about HTTP (reading JSON, sending status codes). Repositories should only care about SQL. The Service is the brain that holds the business rules.

    Admin only rule: : I implemented a check in the PostService that looks at the user's role. If they aren't an admin, the service rejects the creation before it ever touches the database.

    React Comparison: This is like moving logic out of a component and into a dedicated custom Hook or Context provider to keep the UI dumb and the logic centralized.

5. ACID transactions (db.begin)
    What: Used SQL transactions to handle post creation.

    Why: Creating a post now involves multiple steps.
        1. Insert the post.
        2. Insert/Find tags.
        3. Link them in the join table.

    The all or nothing rule: If step 3 fails, I don't want step 1 to stay in the database. tx.Rollback() ensures that if any part fails, the whole operation is canceled, keeping the database clean and atomic.

6. Advanced SQL & The N+1 Problem
    The Challenge: Fetching a post along with its category name and all its tags

    LEFT JOIN: Used LEFT JOIN categories to bring in the category name. I learned that if a post has no category, SQL returns NULL, so I used sql.NullString in Go to handle that safely without crashing.

    N+1 Discovery: I learned that running a separate query for tags inside a loop for posts is called the N+1 problem. It's fine for my library now, but for a massive app, I would need more advanced SQL (like ARRAY_AGG) to fetch everything in one single query.

7. Dependency Injection Refactoring
    The Wiring: I had to update main.go to follow a new order: DB -> Repository -> Service -> Handler.

    esson: If I change the  Constructor of a handler (e.g., making NewPostHandler take a Service instead of a Repo), I must update the wiring in main.go. This is called dependency injection. Passing the tools a function needs to do its job.

8. Centralized Security (The .env Win)
    What: Moved the JWT_SECRET out of the code and into the .env file.

    Why: Previously, i had the secret key typed in two different files. if i changed one and forgot the other the gatekeeper would break.

    The fix: Both the GenerateToken utility adn the AuthMiddleware now use os.Getenv("JWT_SECRET").

    Lesson: Never hardcode secrets. Centralizing them in .env makes the app more secure and prevents key mismatch bugs that are a nightmare to debug.

9. Relational Mastery 2026-02-23
    The type safety trap: Discovered that Go context keys are type specific contextKey("role") is invisible if yoiu search for the string "role".

    Scheam synchronization: Fixed SQLSTATE 42703 by ensuring the PostgresSQL table columns matched the Go struct fields exactly.

    Statelles reality: Mastered the JWT lifecycle roles must be updated in the DB before logging in to get a valid admin token.


Phase 4: Interaction & Polish 2026-02-23

1. Dynamic SQl & Search (ILIKE)
    What: Implemented a keyword search that scans both title and content.

    The 1=1 trick: Used Where 1=1 as a base for SQL queries. This allowed me to dinamically append AND clauses for categories or search terns without worrying if it was the first filter or the second.

    Pattern matching: Learned that ILIKe is the superpower of Postgres it performs case insensitive searches so that "PHASE" and "phase" return the sam results.

    Lesson: Percent signs are wildcards. Searching for %logc% finds "logic", "logical", and "biologic".

2. The many to mahy likes system
    Logic: Created a likes table to track the relationship between users and posts.

    The unique constraint: Applied UNIQUE(user_id, post_id) at the database level.

    Why: This is defensive programming. Even if my Go code has a bug and tries to save a duplicate like, the Database acts as the fonal shield and rejects the double entry.


    Toggle pattern: insted of a simple Add button, i built a ToggleLike function. It checks if a record exists, if it does, it deletes it (unlike), if it does not it creates it (like).

3. Subqueries for Performance
    Optimization: Instead of fecthing every like and counting them in Go. I used a SQL subquery: (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count.

    The win: The database returns the total number as a single integer. This is much faster than sending thousands of like rows  over the network just to count them.

4. Architectural Boundaries Repo trap
    Struggle: Encountered a compiler error by accidentally putting HTTP handler code into the repository file. 

    Lesson: Repositories are database only. They should not know that the interent exists. They only take simple data types (int, strings) and return data or errors. Handlers are the translators rhat turn HTTP requests into those simple types.

5. Dependency chain update
    Flow: Finalized the 4 step feature workflow:
        1. Model: Update the struct (e.g, add LikeCount)

        2. Repositroy: Write the SQL (e.g, ToggleLike)

        3. Service: Add business logic (e.g, s.repo.ToggleLike)

        4. Handler: Map the URL and UserId to the Service.

    Refinement: Learned that the UserID should be pulled from the r.Context() (placed there by middleware) to ensre a user can only like as themselves.


VERSION 2 

Phase 1: Transitioning 2026-02-24

1.  Public Discovery Architecture
    Public vs Private Routing: I learned how to use chi.Router groups to separate public
    Read operations from protected write operations. This is crucial for building apps where discovery is free but interaction requires identity.

    Database Schema Evolution:
    I implemented my first migration by adding image_url and slug columns. Slugs are essential for SEO and making URLs more human-readable (e.g, /posts/my-cool-photo vs /posts/3).

    The Power of BlurHash:
    Learned that modern apps don't just load images they store a blur_hash (a small string) to show a beautiful blurred placeholder while the high-res file downloads, preventing layout shifts.

    Relational Logic for Comments: Built a one to many relationship where a comment is tied to both a user_id and post_id, with ON DELETE CASCADE to ensure that if a post is deleted, its comments vanish too (data integrity).

Phase 2: Public Discovery V2 Core 2026-02-25

1. SQL Query Dynamics & The 'Any' Operator
    Problem: How to filter a post by multiple tags passed in a URL query string (e.g, `?tags=vintage&tags=synth`).

    Solution: Used the Postgres `ANY($1)` operator combined with `lib/pq.Array()`.

    Lesson: Standard SQL `IN` clauses are hard to build dynamically with `database/sql`. Passing a slice  as a single argument using `pq.Array` is the "Go-to" way for Postgres.

2. Advanced Scans with Nullable Columns
    Discovery: When joining tables (like `LEFT JOIN categories`), some columns might be NULL.

    Solution: Used `sql.Nullstring` during `rows.Scan`.

    Lesson: Scanning a NULL database value into a standard Go string will cause  a runtime error. `NullString` provides a `.String` field and `.Valid` boolean to handle this safety.

Phase 3: The Social Layer 2026-02-25

1. The custom type Context Trap
    What: I learned that Go's `context.Value()` is keyed by type, not just the string value.

    Why: If the middleware saves a value using type contextKey string, but the handler tries to retrieve it using a plain string, it returns nil.

    Lesson: Use exported constants for context keys across packages to ensure type safety. This prevents shadowing or accidental overwrites from third party libraries.

2. Relational Data Integrity
    What: Implemented `ON DELETE CASCADE` on the comments table.

    Why: In a relational DB, you do not want `orphaned` data. If a post is deleted, its comments should die with it automatically at the database level.

    Lesson: Let the database handle cleanup logic whenever possible, its faster and more reliable than writing manual cleanup code in Go.

3. The COALESCE Pattern for Joins
    What: Used `COALESCE(u.username, 'unknown_user')` in a SQL JOIN.

    Why: Go's string type cannot hold a NULL value. if a join returns a null column (like a user without a username), `rows.Scan()` will crash the entire request.

    Lesson: Use `COALASECE` in SQL to provide a default fallback value directly in the result set, making your Go code much more resillient to imperfect data.

4. Unique Constraint Defense
    What: Attempted to bulk fill usernames and hit a `unique_violation`.

    Why: A `UNIQUE` constraint on a column does not just block duplicates during `INSERT`, it blocks them during `UPDATE` too.

    Fix: Used SQL string concatenation `('user_' || id)` to generate unique temporary data based on the primary Key.

5. The silent error 
    What: The API returned 500 but the terminal showed nothing until i looked at the panic trace.

    Why: The `chi.Middleware.Recoverer` catches panics to keep the server from crashing, but it can hide the why if you are not looking at the console logs.

    Lesson: When a request fails in under 1ms with a 500 error, its almost always a Go panic(like nil pointer or bad assertion) rather than a slow database error.

    

