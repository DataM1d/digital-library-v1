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
    database/sql: This is built into Go: it's an interface. It know how to talk to any SQL database, but it does not know the 'language' of Postgres specifically.
    
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

5. The Silent error 
    What: The API returned 500 but the terminal showed nothing until i looked at the panic trace.

    Why: The `chi.Middleware.Recoverer` catches panics to keep the server from crashing, but it can hide the why if you are not looking at the console logs.

    Lesson: When a request fails in under 1ms with a 500 error, its almost always a Go panic(like nil pointer or bad assertion) rather than a slow database error.


Phase 3: The Slug & Collision Engine 2026-02-25

1. String Proccesing with Regex:
    What: Built a utility to convert titles like "Modern Art!" into "modern-art".

    The Regex Trap: Learned that `[^a-z0-9]+` removes spaces, making `[^a-z0-9]+` removes spaces, act on empty characters between letters.

    Fix: Used `[^a-z0-9\s]+` to preserve spaces temporarily, then swapped spaces for hyphens. This taught me that Regex is powerful but requires precise "character white-listing."

2. The Collision Resolution Algorithm:
    Concept: Handled the Unique Constraint problem where two posts can't share the same slug.

    Implementation: Created a recursive `for` loop in the Service layer. It checks the DB for a slug, if it exists, appends a counter (`-1`, `-2`) and checks again.

    Architecture: This proved why the Service layer exists. The Repository should not decide how to rename a post, it just reports if a name is taken. The Service is the brain that decides the new name.

3. Clean URLs (SEO):
    What: Shifted from `posts/5` to `/posts/s/industrial-minimalist`.

    Lesson: Learned that IDs are for computers, but Slugs are for humans and Search Engines. Using strings as primary identifiers in URLs makes the platform feel like a real product.

Phase 4: Binary Data & Physical Storage 2026-02-26

1.  Multipart Form Handling:
    What: Used `r.ParseMultipartForm(5 << 20)` to handle image uploads.

    Lesson: Standard JSON handlers can't read images. You have to switch to multipart/form data. The 5 << 20 bit is a bit shift that sets a 5MB limit essential for preventing users from crashing your server with 10GB files.

2.  The io.Copy:
    What: Used `io.Copy(dst, file)` to move data from the network request to the hard drive.

    Lesson: In Go, data is often treated as a Stream (Reader/Writer), You do not have to load the whole image into memory (RAM), you just pipe it from the request straight to a file. This is why Go is so efficent for file servers.

3.  Static File Saving:
    What: Registered `http.FileServer` on the `/uploads/` route.

    Concept: I learned that API routes (which return JSON) and File routes (which return images) can live on the same server. By using `http.StripPrefix`, I can keep my folder structure clean while making images accessible via a URL.

4.  The Post Upload Reference Pattern:
    Concept: Do not send the image and the post data in one giant request:

    Flow: 1 Upload image -> Get URL back. 2 Create Post -> include the URL in the JSON.

    Why: This makes the API more resillient. If the post creation fails, you still have the image. If the image upload fails, you do not waste DB resources.


Phase 4:a Optimization, Refinement version 2: Binary Data, Physical Storage & The Lifecycle Final 2026-02-27

1. Service vs Repo:
    What: Implemented DeletePost logic that removes both the DB row and the physical file.

    Lesson: The Repository handles the SQL, but the Service decides to call `os.remove()` to clean up the disk. This prevents orphaned images from filling up the server.

2. RESTful Roputing Mastery:
    What: Encountered 405 method not allowed errors.

    Lesson: Learned that Chi router is strict. If you define a `GET for /posts `but not a `PUT for /posts/{id}`, the server will reject the request. Every CRUD operation needs its own explicit method + path registration.

3. The Service Layer Migration:
    What: Refactored the Authentication logic out of the AuthHandler and into a dedicated UserService.

    Why: Previously, the AuthHandler was doing too much. Hashing passwords, generating JWTs, and talking to the database. By moving this to a Service, the Handler now only handles HTTP `(Request/Response)`, making the code easier to test and maintain.

    Lesson: If Handler has more than 10 lines of logic before hitting the database, that logic probably belongs oin a Service.

4. Dependency Injection & Wiring
    What: Updated main.go to initialize `Category` and `User` services.

    Concept: Followed the strict Bottom up initialization order:

    1. Connect Database.
    2. Initialize Repositories.
    3. Initializd Services.
    4. Initialize Handlers.

    Lesson: This wiring in main.go is what makes the app modular. Because every piece is injected into the next, i can swap a database or a service without breaking the rest of the application.

5. Category CRUD & Data Normalization:
    What: Implemented full API support for categories(Create, List, Delete).

    Why: Moving from hardcoded strings to a dedicated categories table allows for dynamic growth by linking posts to category IDs, i ensured that renaming a category in one place updates it for every associated post automatically.

    Lesson: Relational databases are built for this. Use IDs for linking and names only for displat.

6. The Importance of go.sum:
    Discovery: Learned that adding a line to go.mod manually isn't enough; the go.sum file must contain a matching security hash.

    Action: Used go mod download and go mod tidy to synchronize the security fingerprints of the new lib/pq dependency.

    Lesson: go.mod is the shopping list and go.sum is the receipt that proves the ingredients are authentic and have not been tampered with.

Phase 4: Security Hardening & The Defensive Layer 2026-02-27

1. Rate Limiting with the Token Bucket Algorithm:
    What: Implemented RateLimitMiddleware using golang.org/x/time/rate.

    Why: To prevent Brute Force attacks on /login and DDoS/Disk filling attacks on /upload.

    The Logic: I learned the Token Bucket concept. A bucket holds a burst of tokens (e.g, 3) Tokens refill at a steady rate (e.g, 5 per minute). Each request costs one token. If the bucket is empty,  the user gets an HTTP 429 Too Many Requests.

    Lesson: This is more efficient than a simple counter because it allows for natural bursty behavior while maintaining a strict login-term average.

2. Surgical Middleware Application:
    What: Used chi.Router's `.With()` method to apply rate limiting only to specific sensitive routes.

    Concept: You don't want to rate limit the entire API (like browsing posts), only the expensive or dangerous endpoints.

    Lesson: Middleware can be global `r.Use` or specific `r.With`. good architecture applies security exactly where the threat exists, rather than punishing normal users.

3. Thread Safe Limiter Mapping:
    What: Used a `map[string]*rate.Limiter` combined with sync.Mutex.

    Why: In Go, maps are not thread safe. If two requests from different IPs hit the server at the exact same millesecond, the map could crash.

    Lesson: `mu.Lock()` and `mu.Unlock()` are the traffic lights of go concurrency. They ensure only one goroutine can modify the IP to Limiter map at a time.

4. Content Sanitization (XSS prevention)
    What: Integrated the `bluemonday` library into the PostService.

    Why: Even with a secure login, an Adming could accidentally post content containing `<script> `tags that steal user cookies.

    Strategy: HTML gets washed in the Service layer before it hits the database.

    Lesson: Never trust user input, even from an Admin. By using `bluemonday.UGCPOlicy()`, it strips out dangerous attributes like `onclick` or `onerror` while keeping safe tags like `<b>` and `<i>`.

5. Production Ready HTTP Timeouts:
    What: Refactored `http.ListenAndServe` into a custom `http.Server` struct    with `ReadTimeout` and `WriteTimeout`.

    Why: To prevent Slowloris attacks where a client opens a connection and sits on it forever, eventually exhausting the server's resources.

    Lesson: A naked `ListenAndServe` is fine for local dev, but a real server needs explicit timeouts to protect itself from hanging connections.


phase 4: 2026-02-28

1. Self Referencing Foreign Keys:
    What: Added a `parent_id` column to the comments table that points back to `comments(id)`.

    Why: This allows a comment to know who its parent is, creating a hierarchy without needing a separate table for replies.

    Lesson: Using `ON DELETE CASCADE` on a sel referencing key is vital, if a top level comment is deleted, all its nested replies are automatically wiped by the DB, preventing orphaned text.

2. Pointers for Nullable JSON:
    What: Used `*int` for ParentID in the Go struct.

    Why: in Go, an int defaults to 0. If a comment has no parent, the DB returns NULL. A pointer can hold nil, which maps perfectly to NULL, whereas a plain int would try to find a parent with ID 0.

    Lesson: Use pointers in structs whenever a field is optional or nullable in the database.

3. Recursive Tree Construction (The Map to Tree Pattern):
    What: Transformed a flat slice of comments into a nested tree structure in the Service layer.

    The logi: 1. Loop once to put all comments into a `map[int]*comment` (O(n)speed). 2. Loop again, if it has `parent_id`, append the current comment to the parent's Replies slice. If not, add it to the root slice.

4. Dynamic SQL Argument Management:
    What: Implemented a manual argument counter `argCoun` in the Repository to build complex WHERE clauses.

    Why: When queries have optional filters (Search, Category, Tags, Status), you can't hardcode $1, $2. If Category is missing, the next filter needs to take over its placeholder number.

    Lesson: Building a slice of `interface{}` and tracking the index allows for truly elastic queries that don't break when a user leaves a search field empty.

5. Role Based Data Filtering:
    What: Updated GetAllPosts to accept a userRole and conditionally apply a status = `published` filter.

    Why: Security isn't just about blocking a route; it's about controlling what data is visible. Admins need to see their Drafts to edit them, but the public should never see unreleased content.

    Lesson: The Service layer is the Truth Provider. It mediates between what the Handler asks for and what the Repository is allowed to give back.

6. SQL INNER JOIN for User Activity:
    What: Created the `GetUserLikedPosts` method using a JOIN between posts and post_likes.

    Why: To display a Favorites page, you need data from two tables: the fact that a like exists from `post_likes` and the content of the post (from posts).

    Lesson: Joins are significantly more performant than N+1 queries (fetching IDs first and then looping to fetch each post individually).

7. The Playhead Reset:
    What: Learned that once io.Copy reads a file, the internal pointer is at the very end.

    Why: If you try to `image.Decode` immediately after, it finds nothing.

    Lesson: `file.Seek(0, 0)` is mandatory when performing multiple read operations on a single file stream.  

8. Side Effect Imports for Images:
    What: Added `_ "image/jpeg"` and `_ "image/png"`.

    Why: Go's `image.Decode` is a generic entry point. It doesn't include every format by default to keep binary sizes small.

    Lesson: The underscore import runs the init() function of those packages, registering their magic numbers so Go knows how to handle common image formats.

9. Blank Identifier Imports (_):
    What: Used `_ "package/path"` for image decoders and database drivers.

    Why: To trigger side effects (running the package's init() function) without using the package's exported names in the code.

    Lesson: This is the standard way Go handles plug and play registration. Without it, the image package is just an empty shell that can't decode anything.

10. File Pointers and Multiple Reads:
    What: Learned that io.Reader moves a pointer through the file data.

    Why: You cannot read a file twice in a row without seeking back to the start.

    Lesson: Use `file.Seek(0,0)` between operations like saving to disk and processing for BlurHash.

11. Ignoring Return Values:
    What: Used the blank identifier _ in a multi value return.

    Why: `image.Decode` returns the format name (e.g, "jpeg") but if it is not needed for logic, the underscore prevents unused variable compiler errors.

phase 4: Meta description and Database Seed Script: 2026-03-01

12. Open Graph and SEO in APIs:
    What: Added `meta_description` and `og_image` to the data model.

    Why: APIs are not just for data, they provide the tags that social media crawlers use to generate rich previews.

    Lesson: If `og_image` is empty, the frontend should default to the main `image_url`.

13. SQL DO Blocks for Seeding:
    What: Used a `DO $$BEGIN ... END$$` block in postgres to run a loop.

    Why: Writing 50 INSERT statements manuallt is a waste of time.

    Lesson: SQL Logic (loops random selections) directly in the database to generate massive amounts of test data instantly.

phase 4: CORS and Pre Flight: 2026-03-02

14. CORS:
    What: Learned that for complex requests like `DELETE` or `JSON POSTs`, browsers send a hidden OPTIONS request first.

    Why: The browser asks the server, is it safe for me to send this data before actuallt sending it.

    Lesson: The `rs/cors` package handles these pre flight requests automatically, saving time and effort from writing complex logic in router.

15. Health checks vs Liveness probes:
    What: Added a `/health` endpoint.

    Why: It is a standard for modern infrastructure. If the health check fails, a load balancer can stop sending traffic to that instance automatically.

16. Wrapping the Router:
    What: Learned that top level middleware like CORS should wrap the entire chi.Router rather than being an internl `r.Use()`

    Why: If a browser tries to fetch a static image from `/uploads` from a different domain, it still needs those CORS headers.

    Lesson: `cors.Handler(r)` creates a new http.Handler that acts as a bodyguard for the entire app.

phase 4: Final: 2026-03-03
1.  Synchronizing Multi Value Returns in Go:
    I learned that Go's strict type system requires every layer of a 3 tier architecture to     
    explicitly handle the contract of returned values. When adding pagination i had to update the entire chain.
    
    Repository: `GetAll` now returns `([]Post, int, error)` to provide the total record count.

    Service: Must receive all three values and pass them up, even if it does not manipulate the `total` count.

    Handler: Uses the `total` to calculate `total_pages` for the frontend metadata.

2.  Recursive Data Structures from Flat SQL Results:
    To Build a threaded comment system without hitting the database multiple times (avoiding the N+1 problem), I implemented a tree building algorithm in the `CommentService`.

    The logic: Fetch all comments for a post in one query, store them ina `map[int]*Comment`, and then iterate through the slice to attach children to their respective parents using pointer references.

3. Atomic Transactions with PostgreSQL in GO:
   I implemented `tx.Begin()` and `tx.Commit()` in the `PostRepository`. This ensures that when a Post is created, its associated Tags are also linked correctly. If the tag insertion fails, the database rolls back the post creation, preventing orphan posts with missing metadata.

4. Security & Sanitization:
   HTML sanitization: Integrated `bluemonday` in the Service layer. This ensures that even if an admin inputs custom HTML, the system strips out dangerous tags (XSS protection) befor the data reaches the database.

   Opaque Auth Errors: Standardized login error messages to be generic (invalid email or password). This prevents attackers from using the login form to discover which emails are registered in the system.

5. Middleware Strategy:
   Rate Limiting: Implemented an IP Based rate limiter using `golang.org/x/time/rate` specifically for high risk routes like `/upload` and `login`.

   Context Keys: Used a custom `ContextKey` type for JWT claims to avoid context collisions where different middlewares might accidentally overwrite each other's data.

CORRECTION OF BACKEND(Chi to Gin Migration): 2026-03-05

1. The Gin Backend Evolution:
   I learned that Gin replaces the standard http.ResponseWriter and `*http.Request` with a single, powerful `*gin.Context.` This object handles everything from getting URL parameters `(c.Param("id"))` to sending JSON responses `(c.JSON())` in one line. It simplifies the code by removing the need for manual JSON encoding.

2. Grouped Routing & Middleware:
   I learned that Gin’s router.Group() is far more intuitive for API versioning and protected routes. By using `api := r.Group("/api")`, i can apply the `AuthMiddleware` to an entire group of routes (like `/posts` and `/users/me`) at once, rather than attaching it to every single endpoint manually.

3. Native JSON Binding:
   I learned about `c.ShouldBindJSON(&input).` Instead of manually reading the request body and unmarshalling it, Gin does this automatically and can even validate the data using binding tags in the Go structs. This makes `auth_handler.go` much cleaner.

4. Response Standardization:
   I learned how to create a consistent JSON response strcutre using `gin.H()` This ensures that every time error or success message is sent, frontend receives a predictable object:
   {
    "status": "success",
    "data": { ... }
   }

5. Advanced Media Handling & Concurrency:
   I learned how to move beyond simple JSON to handfle Multipart Form Data for file uploads. This required three key shifts in my approach:

   Security Sniffing: 
   I learned not to trust file extensions. By reading the first 512 bytes of an uload and using `http.DetectContentType`, I can verify the Magic Bytes to ensure a file is actually a JPEG/PNG and not a malicious script.

   The kill swith: Using `http.MaxBytesReader` to hard limit request sizes (e.g, 5MB) at the network level. This prevents Denial of Service (DoS) attacks before the server even begins parsing the file.

   Background Goroutines: 
   I learned how to use the go keyword to offload expensive CPU tasks (like BlurHash generation) to a bacxkground thread. This allows the API to respond to the user instantly while the server finishes the math silently in the background. 

6. Middleware as a Security Layer:
   AdminOnly Bouncer: 
   I learned how to create a middleware that reads the `role` directly from the Gin context (set by the previous Auth middleware). This ensures that even if a user is logged in, they cannot hit `/api/admin` routes unless they have the `admin` string  in their JWT. 
w
   CORS Preflight
   I solidified my understanding of why browsers send `OPTIONS` requests. By manually setting headers and returning `204 No Content` for `OPTIONS`, I cleared the final hurdle for the Next.js to Go communication.

7. Soft Delete vs Hard Deelete Logic:
   I implemented a Soft Delete strategy in the `post_repo.go`. Instead of using `DELETE FROM`, I use `UPDATE posts SET deleted_at = NOW()`. This taught me:
     1. Data Retention: It's safer to hide data from the user than to destroy it.

     2. Query Filtering: Every `GET` request now need to check `WHERE deleted_at IS NULL` to ensure archived posts don't show up in the public feed.

8. The Ghost Method Trap:
   I encountered the `undefined (type *handlers.CategoryHandler has no field) or method GetAll)` error. This taught me that in Go, if a method is not explicitly defined on a struct, the router cannot see it. I learned to verify that my Handler, Service and Repository all use the exact same verb (e.g, `Create` vs `CreateCategory`) to maintain the chain of command. 

9. Dependency Injection & Environment Wiring:
   I moved beyond hardocded database strings. I learned how to pull 5 distinct environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`) and pass them at strict arguments to `database.NewPostgresDB()`. This taught me:
     1. Argument Integrity: The order of strings passed into a function must match it's definition exactly.

     2. Security: Keeping credentials out of `main.go` and in `.env` is the only way to safely push code to GitHub.

11. Dynamic SQL and Filter Injection
    I refined the GetAll method in `post_repo.go` to handle complex searching and filtering. I learned how to build dynamic SQL strings using `fmt.Sprintc` and positional arguments like $1, $2 to prevent SQL injection while allowing users to filter by category, status, or multiple tags simultaneously.

12. The Assigment Mismatch & Interface Sync:
    Problem: The Repository was returning (`string, error`) to pass a file path, but the Service expecting only error.

    Solution: Decoupied the Data Fetch from the Action. The Service now calls `repo.GetById` to get the metadata (like `ImageURL`) before calling `repo.Delete(id)`. This keeps the Repository Delete method clean with a single `error` return. 

-- FRONTEND --

Phase 1: Full Stack Type Safety & Authentication Architecture: 2026-03-04
1. Eliminating the Any Gap:
   I learned that using any in TypeScript API client is a silent killer for full stack apps, by creating specific interfaces like `LoginCredentials` and `RegisterPayload` that mirror my Go `User` struct and handler logic, i enabled compile time validation. Now if i change a field name in Go, TypeScript will immediately flag the mismatch on the frontend.

2. Next.js 15 Image Security (Local Development):
   I discovered that the Next.js `<Image />` component requires explicit permission to render assets from a non standard port. Since my Go backend serves images from `:8080/uploads`, i had to configure `remotePatterns` in `next.config.ts`. This ensures the frontend can securely optimize and display covers and post images served from the Go server.

3. The Global Auth Provider Pattern:
   I implemented a `useAuth` hook and `AuthProvider` using React Context This solves two major problems:
   1. Persistence: It checks `localStorage` on mount to keep the user logged in across refreshes.

   2. State Sync: It allows any component(like a "Like" button or an Admin sidebar) to instantly know the user's role and authentication status without prop drilling.

4. Generic API Request Wrapper:
   Instead of repetitive fetch calls, i built a centralized `request<T>` utility. 
   This automatically:
   1. Injects the JWT Bearer token into headers if it exists.

   2. Standardizes error response so the frontend can display the exact error message sent from the Go handler.

   3. Handles "204 No Content" responses gracefully which is common in Go `Delete` or `Update` operations.

5. Next.js 15/16 Reset: 
   Learned how to strip default Vercel styling to create a clean, brand neutral foundation using Tailwind 4.

6. Type Safe API Engine: 
   Confirmed that mapping Go structs to TypeScript interfaces in
   `src/types/index.ts`. Allows the frontend to predict exactly what the backend sends, preventing
   indefined errors during rendering.

7. Strictt ESLint Compliance: S
   Successfully resolved all `no-explicit-any` warnings by defining strict
   interfaces for `LoginCredentials` and `RegisterPayload`, matching the Go backend service layer exactly.

phase 2: Bridge Between Go and Next.js: 2026-03-06
1. Zod as a Runtime Guardian:
   I learned that TypeScript only checks types during development, but Zod checks them while the app is actually running. By passing the API response through `UserSchema.parse()`, I ensure that if the Go backend changes, the frontend catches the error immediately at the border instead of crashing later in a component.

2. Symmetry Requirement:
   I learned that an API Contract is a two wat street. If my TypeScript interface `(index.ts)` says a role is `'user`' | `'admin'`, but my validation schema just says `string`, TypeScript will throw an error to protect me. I must use `z.enum()` to match specific string literals.
   
3. Context Initialization Pattern:
   I learned how to safely initialize an Auth state by checking localStorage inside a useEffect. This hydration step is crucial in Next.js 15 to prevent server/client mismatch errors.

4. Dynamic Routing:
   I learned that in Next.js 15, the params object in dynamic routes is now an asynchronous promise. You cannot just use `params.slug;` you must unwrap it using the `use(params)` hook in client components. This ensures the UI stays in sync with the URL.

5. Gin CORS Preflight Logic
   I learned that before a browser sends a real POST request, it sends an OPTIONS request called a preflight. If the Go backend doesn't handle this with a 204 No Content status, the browser blocks the login/register attempt even if the credentials are correct.

6. API URL Prefixing:
   I learned that since the Go backend serves images from its own local folder (port 8080), the frontend (port 3000) must manually prefix the backend URL to any image path strings coming from the database, otherwise, the browser looks for the image in the wrong place.

phase 3: Interactive Social Layer: 2026-03-06
1. Optimistic UI pattern:
   Implemented a Like system that updates the UI state immediately before the server responds. I learned that by storing the previous state and reverting it only on a `catch` block, the app feels significantly faster and more responsive to the user.

2. Recursive Component Architecture:
   Built a nested comment system where a single `Comment` component renders itself for sub replies. This taught me how to handle tree structured data coming from a relational database (PostgreSQL) and display it as an infinite depth discussion thread.

3. Namespace Collision Management:
   Discovered that `Comment` is a reserved global type in browsers (referring to DOM comment nodes). I learned the importance of using specific naming conventions like `PostComment` or `CommentType` to prevent TypeScript from confusing backend data with buitl in browser APIs.

4. Async Params Unwrapping:
   Solidified the Next.js 15 pattern of using the `use()` hook to unwrap `params` in Client Components. This ensures that dynamic route segments like `[slug]` are handled as asynchronous resources, preventing hydration mismatches.

5. Authenticated Request Interceptors:
   Refined a centralized `request` helper that automatically injets JWT Bearer tokens from `localStorage` into every outgoing API call. This ensures that protected Go routes (like `/like` or `/comments`) always receive the necessary credentials without manual boilerplate in every component.

phase 4: Reliability & Production Polish: 2026-03-06
1. Derived State vs Effects:
   Learned that using `useEffect` to sync props to state (like in an Image fallback) causes unnecessary cascading renders. Switched to the `key` prop pattern to reset component state instantly when props change, significantly improving performance.

2. Perceived Performance with Skeletons:
   Implemented Skeleton loaders for the post grid. I learned that perceived speed is more important than actual speed; by showing the layout structure immediately, users feel the app is faster compared to showing a generic loading spinner.

3. Global Error Boundaries:
   Used Next.js `error.tsx` to create a Safety Net. This ensures that if the Go backend or a specific component fails, the entire application doesn't crash. Instead, it provides a clean, branded recovery UI.

4. The Bouncer Pattern:
   Created a `ProtectedRoute` Higher Order Component. This acts as a reusable gatekeeper that checks the `AuthContext` before rendering sensitive pages, redirecting unauthenticated users to `/login`.

5. Toast Notifications for Feedback:
   Integrated `sonner` for global non intrusive feedback. I learned that providing immediate visual confirmation for actions (like liking or logging out) is essential for a professional feel.

Phase 5: Discovery & Content Logic: 2026-03-07
1. The Debounce Pattern:
   Learned that hitting an API on every keystroke is a Denial of Service (DoS) attack on myself. By using `use-debounce`, I reduced server load by over 80% during user search sessions.

2. URLSearchParams vs Manual Strings:
   Discovered that manually building query strings with `?` and `&` is error prone. Using the native `URLSearchParams` API in `api.ts` ensures that special characters in search queries are automatically encoded, preventing URL breakage.

3. Refinement of the API Contract:
   Shifted the API wrapper from accepting raw strings to accepting configuration objects. This makes the code more readable and easier to extend with new parameters like `sort`, `filter`, or `limit`.

4. Dynamic Empty States:
   Learned that a "No Results" message is just as important as the results themselves. Providing feedback specific to the search query (`No results for "XYZ"`) improves the user experience significantly.

Phase 6: Infrastructure & Media: 2026-03-07
1. The Multipart Boundary:
   I learned that when sending files via `FormData`, the browser must set the `Content-Type` header itself. If i manually set it to `application/json` or even `multipart/form-data`, the browser fails to include the boundarey string. This boundary is the only way the Go backend knows where the Title field ends and image binary begins.

2. Byte Sniffing for Security:
   I discovered that trusting file extensions (like.jpg) is a security risk. By using Go's http.DetectContentType on the first 512 byted of an upload, the server can verify the real file type. This prevents Extension Spoofing where a user tries to upload an executable script disguised as an image.

3. Type Safe Header Managment:
   Refactoring the api.ts to use the native `new Headers()` constructor instead of a plain object or any fixed ESLint errors and provided better type safety. It allows for dynamic header manipulation (like conditionally adding Authorization or Content-Type) without breaking TypeScript's strict rules.

phase 7: Interactive UI & Stream Tracking: 2026-03-08
1. Array State Managment in React:
   I learned how to manage a list of strings using a dedicated UI component. By using a keyboard event listener(onKeyDown). I can intercept the Enter key to prevent form submission and instead push a new string into the state array.

2. Why Fetch Fails at Progress Tracking:
   I discovered that the native `fetch` API does not provide a way to monitor the upload progress of a request. While `fetch` is great for simple JSON, it's a black box once the request starts. To show a real percentage bar, I had to switch that specific call to `Axios`, which hooks into the `onUploadProgress` event of the underlying `XMLHttpRequest`.

3. The instanceof Error Type Guard:
   In TypeScript `catch` blocks, the error is technically `unknown`. I learned that I shouldn't just cast it to any. Instead, using `if (error instanceof Error)` is the better way to prove to the compiler that the object has a `.message` property, ensuring the code is safe from runtime crashes.

4. The Ghost Form Pattern:
   I learned how to decouple a submit button from the form's location using the form attribute (e.g., `<button form="my-id">`). This allows me to keep the Publish button in a fixed header or sidebar while the actual input fields are deep within a different part of the DOM.

5. Frontend Image Handling and UX:
    In` ImageUploadZone.tsx`, I learned to manage client side previews using `URL.createObjectURL.` This provides instant feedback to the user before the upload begins. On the dashboard (page.tsx), I utilized Next.js Image optimization and loading skeletons to maintain high perceived performance during archive management.


phase 8: Content Managment: 2026-03-10
1. Safe Error Catching (Unknow vs Any):
   I learned that even in `catch` blocks, using `any` is dangerous.
    1. The Change: Switched to `catch (error: unknown)` combined with an `instanceof Error` check.

    2. The Lesson: This forces the code to verify that an error object actually has a `.message` property before trying to display it in a toast, preventing "Cannot read property of undefined" errors during failed API calls.

2. Optimistic Deletion Logic:
   I implemented a balance between UI speed and data integrity.

   The Logic: For deletions, I update the UI locally first (`filter`) so the user feels no lag.

   Conflict Resolution: For additions, I perform a full re fetch. This ensures the frontend and the Go backend agree on the new category's ID and slug, which are generated server side.

3. Foreign Key UI Feedback
   I learned how to translate database constraints into user friendly messages.

   The Scenario: Deleting a category that has posts.

   The Fix: Since the Go backend returns a 409 or 500 error due to Foreign Key constraints, the frontend catch block now identifies this specific failure and alerts the user that the category is locked by active links.

Phase 8 & 9: Admin Suite & Search Discovery: 2026-03-10
1. Zod & The Null vs Empty Array Trap:
   The Bug: Go slices declared as `var posts []models.Post` encode to `null` in JSON if empty. Zod expects an `array`, causing a frontend crash.

   The Fix: *Backend: Initialize slices as `posts := []models.Post()` to ensure an empty JSON array[].

   The Fix: *Frontend: Use `.nullable().transform((val) => val ?? []) in Zod as a Safet net to handle backend inconsistencies.

2. Next.js image Optimization (400 Bad Request):
   External images (even from localhost:8080) must be whistelisted in next.config.ts under `remotePatterns`. Without this, the Next.js `Image` component refuses to process the source URL.

Refactor: 2026-03-11
1. Custom Hooks:
   Instead of letting components fetch their own data or manage complex state, I moved everything into a dedicated `/hooks` directory.

   Lesson: Components should only be responsible for the UI. The Logic belongs in hooks.

2. Solving the Hydration Flicker:
   Learned how to use a `mounted` state in `AuthContext` to prevent Next.js from throwing erros when accessing `localStorage`.

   Key Concept: 
   The server does not have a `window` or `localStorage`. By waiting for useEffect to set `mounted = true`, client and server agree what to render.

3. Stability with `useCallback`:
   Fixed the infinite Loop bug in the `useEffect` by wrapping fetch functions in `useCallback`.

   Lesson:
   If a function is a dependency in `useEffect`, it must be stable. Otherwise, React re creates the function on every render, triggering the effect again and again

4. Type Aligment (Go <-> TypeScript): 
   Encountered the strictness of Typescript interfaces when they did not match the go JSON output.

   Strategy: 
   `PaginationMeta` to match the Go struct naming (`total_items` vs `total`).

   Lesson:
   Use optional properties `?` in interfaces for metadata (like `created_at`) that is not always returned by light API versions.

Refactor: Fullstack Synchronization. Slug, Services and State: 2026-03-12
1. Slug vs ID Dillema (backend):
   Problem: 
   The frontend uses Slugs(strings) for URLs, but the database needs IDS (integers) for relations.

   Solution:
   Instead of making the Handler do database lookups, i injected the `PostRepository` into the `CommentService`. The service now resolves the slug to an ID before performing comment operations.

   Lesson:
   Keep Handlers lean. Logic like find the ID for this slug belongs in the Service layer.

2. Dependency Injection (Go)
   I mastered how to wire up complex dependencies in main.go.

   Concept: CommentService now depends on both CommentRepo and PostRepo.

   The Win: By passing the PostRepo into the CommentService constructor, I enabled cross-repository data fetching without creating circular dependencies. 

3. Hook API Alignment (Frontend):
   I refactored the frontend to be completely logic less at the component level.

   Strategy: 
   The `usecomments` hook now encapsulates the entire lifecycle (loading, submitting and re fetching).

   Discovery: 
   I realized that if the Hook, the API client, and the Backend Routes don't share the exact same parameter types (string vs number), the whole system breaks. Aligment is key.

4. Recursive UI Components
   Implemented a recursive `Comment` component to handle threaded discussions.

   The Lesson: React components can call themselves! This is the most efficient way to render tree like structures (comments and replies) without knowing the depth of the thread in advance.

5. The Multipart Form Data Shift:
   Problem: Standard JSON payloads cannot transmit binary image files alongside structured data (tags, categories) in a single request.

   Solution: Switched the entire Post creation/update flow to multipart/form-data.

   The Lesson: When handling files, you have to manually parse the form in Go using c.Request.ParseMultipartForm. You also have to be careful with arrays—standard PostForm only grabs the first value, so c.Request.MultipartForm.Value["tags"] is required to catch the full list of tags.

6. Asynchronous Performance (BlurHash):
   Concept: Generating a BlurHash is CPU intensive and shouldn't block the user from seeing a "Success" message.

   The Win: Used Go's Goroutines (go h.generateBlurHashInBackground(...)) to process the image and update the database in the background. This keeps the API response time under 100ms while still providing a premium UI experience.

Refactor: Go Backend Refactoring & Clean Architecture: 2026-03-13
1. Interface Driven Development:
   I learned that using `interfaces` for Services and Repositories is the standardf for proffesional Go projects.
   
   Why: it decouples the Handlers from the logic. The Handler no longer cares how a post is created, only that the PostService has a method to do it. 

   Benefit: Makes the code significantly easier to unit test using mocks.

2. The DBTX Pattern for Transactions:
   Handling database transactions across multiple repositories (e.g, saving a Post and then its Tags) is tricky in Go.

   Solution: Implementing a `DBTX` interface that both `*sql.DB` and `*sql.Tx` satisfy.

   Implementation: The `WithTransaction` wrapper allows the Service layer to decide where a transiction starts and ends, keeping the logic out of the Repository.

3. Atomic Tag Synchronixation:
   Previously, tags were an afterthought. I implemented a `SyncPostTags` logic:
   1. Delete old associations in a transaction.

   2. `INSERT ... ON CONFLICT DO UPDATE` for new tags.

   3. Re link tags to the post. This ensures the database never has orphaned 
      tags or incosistent states.

4. Contextual Data (The Like Logic):
   I realized the backend should not just return raw data: it needs to return `contextual state`

   Problem: The frontend needs to know if the current user has liked a post.

   Fix: Updated `GetAll` and `GetBySlug` to accept a `currentUserID` and perform a `LEFT JOIN` or `EXISTS` check in SQL to return a `UserHasLiked` boolean.

5. Pagination Metadata:
   Instead of just returning a slice of items. Proffesional APIs return a metadata object.

   This structure matches the frontend expectations perfectly and makes the UI logic (like "Next/Prev" buttons) much cleaner.

   Structure: `{ "data": [...], "meta": { "current_page": 1, "total_items": 87, ... } }`

Refactor: Go Backend Architecture Refactor: 2026-03-14
1. Service Interface Pattern:
   Decoupling:
   Converted `UserService, PostService, CategoryService, and CommentService` into interfaces. Handlers now depend on abstractions rather than concrete implementations.

   Encapsulation: 
   Used unexported structs (e.g, `postService`) to enforce the use of constructor functions (`NewPostService`), ensuring consistent initialization.

2. Robust Resource Managment:
   Rate Limiter Memory Safety:
   Implemented a background cleanup goroutine in the rate limiter to prune old IP entries and prevent memeory leaks.

   Atomic Transactions: 
   Integrated `WithTransaction` in PostService to ensure database integrity when syncing posts and tags simultaneously.

   File System Hygiene: 
   Added automated cleanup logic in `DeletePost` to remove physical image files when a database record is purged.

3. Enhanced Security & Logic:
   Recursive Data Handling:
   Developed an efficient O(n) map based algorithm for building nested commen trees, avoiding expensive recursive SQL queries.

   JWT Hardening: 
   Updated middleware to explicitly validate signing methods (HMAC) and handle environment variables more safely.

4. Handler Optimization:
   Type Safety: 
   Replaced unsafe type assertions with safe checks in `CommentHandler` to prevent server panics on invalid session data.

   DRY Principles:
   Extracted image processing logic in `PostHandler` into a helper method(`saveUploadedFile`) used by both Create and Update operations.

Go Backend, Interface Patterns: 2026-03-15
1. High Performance String Manipulation:
   What:
   Moved away from multiple Regex passes in `slug.go` to a single pass `strings.Builder` approach.

   Why: Regex is expensive because it compiles a finite automation. Using `unicode.IsLetter` and `strings.Builder` with `buf.Grow()` minimizes memory allocations and CPU cycles.

2. API Response Standardization:
   What: Created.  unified APIResponse wrapper in `utils/response.go`.

   Why: 
   Frontend developers need a predictable structure. Every response now includes a success bollean, an optional `data` object, and a standard `error` string.

   New Utility: 
   Implemented  `AbortWithError` to ensure that failed middleware (like Auth) stops the execution chain immediately in Gin.

3. Middleware & Memory Safety:
   What: Added a background cleanup goroutine (`cleanupLimiters`) to the Rate Limiter.

   Why: 
   A simple map based rate limiter will grow indefinitely as a new IPs connect, leading to a memory leak.

   Implementation: Used a `sync.Mutex` for thread safety and a ticker based goroutine to prune "stale" IP entries every few minutes.

5. Security Refinement:
   Passwords: 
   Added a 72 byte ceilling check for Bcrypt (since Bcrypt ignores anything beyond 72 bytes anyway).

   JWT:
   Moved to `jwt/v5` and added `IssuedAt`, `NotBefore`, and `Subject` claims for better token audiabillity and secuirty against replay attacks.

   Sanitization: 
   Integrated `bluemonday` in the service layer (not the handler) to ensure data is clean before it ever touches the database.

Database Hardening: 2026-03-16
1. Eliminating NULL Scan Conflicts:
   What: 
   Migrated database columns (alt_text, blur_hash, image_url, meta_description, og_image) from nullable to `NOT NULL` with empty string, defaults using `COALESCE` and `ALTER TABLE`.

   Why: 
   In Go scanning a SQL `NULL` into a standard `string` variable triggers a runtime error. By enforcing empty strings at the database level, i eliminate the need for sql.NullString pointers in models. Simplyfing the `PostRepository` logic and ensuring the frontend always receivs valid string.

2. Repository Query Refinement:
   What: 
   Updated `internal/repository/post_repo.go` to synchronize with the new schema and optimized the SQL selection logic.

   Why: 
   To ensure the `Scan` process matches the hardened table structure. This prevents Scan error on column issues and ensures that optional metadata fields like `og_image` are always safely retrievable as strings, even if they have not been explicitly set by the curator.

3. Handler Level Metadata Managment:
   What:
   Updated `internal/handlers//post_handler.go` to handle the new default values for metadata fields during artifact creation and updates.

   Why: 
   By ensuring the handler sends consistent data to the service layer, the integrity of the Archive is maintained. It allows the frontend to rely on these fields being present in every JSON response without needing complex null checks in the React components.

4. Schema First Seeding:
   What:
   Updated `scripts/seed.sql` to include the `NOT NULL` constraints and default values for all initial artifacts.

   Why: 
   Ensures that any fresh environment (development or production) starts with the correct data architecture. This aligns the initial Digital Archive state with hardened Postgres constraints, preventing bugs that only appear after a database reset.

5. Zod to DB Consistency:
   What:
   Aligned the Zod schemas in the frontend with the database defaults for metadata fields.

   Why: 
   By mmatching the frontend validation to the database constraints, unified Contract is created. The frontend knows exactly what the database will provide, and the database knows exactly what the frontend is allowed to send.

Engineering Sprint: Digital Library 2026-03-17
1. Architectural Evloution:
   I moved the project from a basic structure to a Repository Service Handler pattern:

   Interfaces: 
   Created an `interfaces.go` to decouple logic. This allows for easier testing and ensures that the Services do not care how the database works, only that the data arrives.

   Dependency Injection:
   In `main.go`, i manually wired the Onion: Repo -> Service -> Handler. This makes the system scalable and predictable.

2. Security & Middleware:
   Built a multi layered defense system to protect the Go Backend.
   1. Rate Limiting:
      Implemented a Token Bucket algorithm (`golang.org/x/time/rate`). It handles bursts of 5 requests but prevents spam.

   2. Security Headers:
      Added `secuirty.go` to inject `X Frame Options`, `CSP`, and `HSTS`.

   3. Structured Logging: 
      Replaced default Gin logs with a custom `logger.go` that tracks latency and HTTP status codes in a clean format.
   
   4. CORS: 
      Configured for local development to allow the React frontend to communicate without browser blocks.

3. Testing & Reliability:
   Achieved high coverage across the core business logic:
   1. Unit Tests: 
      Created `_test.go` files for Slug generation and all Services (`User`, `Post`, `Comment`, `Category`).

   2. Zero Value: 
      Discovered that Go defaults `time.Time` to `0001-01-01`. Fixed by ensuring SQL `SELECT` statements explicitly include `created_at` and scanning them into the struct.

Engineering Srint: Domain Driven Interfaces & Context Propagation: 2026-03-18
1. Context Propagation:
   Problem: 
   Without `context.Context`, a database query keeps running even if a user cancels the request, wasting server resources.

   Fix:
   Every method from the Handler -> Service -> Repository now accepts `ctx context.Context`.

   SQL context:
   Switched from standard `Exec` and `Query` to `ExecContext` adn `QueryContext`. This allows the Postgres druver ti stop long running queries immediately if the connection is severed.

2. Domain Driven Interfaces & Decoupling:
   Refined the Onion Architecture by centralizing all contracts in `internal/domain/interfaces.go`
   1. Single Source of Truth: 
      Instead of repositories defining their own interfaces, they now implement the global `domain` interfaces. This eliminates circular dependencies.

   2. DBTX Interface:
      Created a shared DBTX interface that encompasses both `*sql.DB` and `*sql.TX`.

   3. Transaction Agnosticism:
      Repositories no longer care if they are running inside a transaction or a standard connection. They just execute against the `DBTX` provided to them.

3. Atomic Service Logic (WithTransaction):
   Improved the reliability of complex operations like `"Create Post + Sync Tags."`

   Atomicity: By passing the `ctx` into `WithTransaction`, the entire operation (SQL queries and logic) is bound to the same lifecycle.

   Error Handling: If any part of the tag synchronization fails in `TagRepo`, the service triggers a `Rollback`, ensuring the database never stays in a partial, "dirty" state.

4. Compiler Driven Refactoring:
   Learned that changing an interface is the fastest way to find "weak links" in a Go project.

   The "Red Sea": 
   By updating the domain.PostRepo interface first, the compiler immediately pointed out every file that didn't meet the new standard. This "Type Safe" refactoring ensures that no part of the app is left behind during a major architectural shift.

5. Context Aware Architecture:
   Refactored the entire data pipeline to implement Context Propagation.

   Problem: 
   Standard database queries (Exec, QueryRow) run to completion even if a user cancels the request, leading to zombie processes.

   Fix:
   Every layer from Handler -> Service -> Repository now accepts a `ctx` `context.Context`.

   SQL Context:
   Switched to `ExecContext` and `QueryRowContext`. This allows the Go runtime to signal Postgres to stop work immediately if a timeout occurs or a connection is severed.


6. Domain Driven Design (DDD) & Dependency Inversion
   Cleaned up the "Onion Architecture" by centralizing all contracts in `internal/domain/interfaces.go.`

   The Win: 
   By moving interfaces to a neutral domain package, I eliminated Circular Dependencies and made the system "Contract First."

   Service Decoupling: 
   Handlers now depend on domain.PostService rather than concrete implementations, allowing for easier mocking and testing.

7. The DBTX Pattern:
   Engineered a shared interface for database operations that works for both *sql.DB (connection pool) and *sql.Tx (transactions).

   Versatility:
   Repositories now use the `DBTX` interface. This means the same repository method can be used for a single query OR as part of a complex multi repo transaction without changing the code.

   Atomic Tags:
   Refactored `SyncPostTags` to use this pattern, ensuring that Create Post and Sync Tags either both succeed or both fail Rollback.

8. Background Task Lifecycle Management
   Learned the critical difference between Request Context and Background Context.

   Request Context: Dies as soon as the HTTP response is sent.

   Background Context: Used `context.Background()` with a manual `context.WithTimeout` for the `BlurHash` generation goroutine. This ensures the image processing finishes even after the user receives their "201 Created" status.

Engineering Sprint: Domain Driven Refactor 2026-03-19
1. Advanced Pointer Logic in Tree Construction:
   Problem:
   Building a nested comments tree from a flat SQL result set often leads to a "Value Copy" traps. Appending to a slice in Go creates a copy, meaning updates to a parent's `Replies` might be lost if not handled via pointers.

   Solution: Implemented a 3 pass pointer map algorithm:
    1. Map Pass: Create a `map[int]*models.Comnment` to stabilize memory adress

    2. Nesting Pass: Iterate through the map to append children to their respective pointer referenced parents.

    3. Root Pass: Extract only the top level nodews where `ParentID == nil` to return the final tree.

2. Pure Service Pattern:
   Optimization: Shifted responsibility for ID fetching to the Handler/Router layer.

   Result: 
   The `CommentService` no longer needs to call `PostRepo` to find a post by slug. It recieves the postID directly. This simplified the service logic and made unit test 2x faster byu reducing the need for complex mocks.


