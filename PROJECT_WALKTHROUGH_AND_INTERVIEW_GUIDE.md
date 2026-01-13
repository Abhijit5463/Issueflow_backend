*99







































































.0000000000000000000000000000000+. `                                                    ````````````````````````````````````````````    `  IssueFlow - Codebase Walkthrough & Interview Guide

This document provides a comprehensive explanation of the **IssueFlow** codebase, explaining "how it works" under the hood and connecting these concepts to common technical interview questions.

---

## 🏗️ Architecture Overview

**IssueFlow** is a decoupled full-stack application:
- **Backend**: Spring Boot 3 (Java 17) providing a REST API.
- **Frontend**: React (Vite) consuming the API.
- **Database**: H2 (in-memory for dev) / PostgreSQL (production).
- **Security**: Stateless Authentication using JSON Web Tokens (JWT).

### 🔄 The Data Flow
1. **User Action**: User clicks "Login" on React Frontend.
2. **API Call**: Axios sends `POST /api/auth/signin` to Spring Boot.
3. **Authentication**: Spring Security validates credentials.
4. **Token Issue**: If valid, server generates a **JWT** and sends it back.
5. **Storage**: Frontend stores the JWT (e.g., in `localStorage`).
6. **Next Request**: Frontend attaches JWT in the `Authorization: Bearer <token>` header for subsequent requests (e.g., `GET /api/tickets`).
7. **Authorization**: Spring Boot Filter intercepts the request, validates the token, and allows access.

---

## 🖥️ Backend Walkthrough (`src/main/java`)

The backend follows a standard **Controller-Service-Repository** pattern (though some logic is currently directly in Controllers for simplicity).

### 1. Security Layer (`com.example.issueflow.security`)
This is the most complex and "interview-heavy" part of the backend.

- **`JwtUtils.java`**:
  - **Role**: generating, parsing, and validating JWTs.
  - **Key Method**: `generateJwtToken()` signs the user's email into a token using a secret key (HMAC algorithm).
- **`AuthTokenFilter.java`**:
  - **Role**: A middleware filter that runs **once per request**.
  - **Logic**: It looks for the `Authorization` header. If found, it parses the token, gets the username, and sets the **SecurityContext** manually. This tells Spring "This user is logged in".
- **`SecurityConfig.java`**:
  - **Role**: The configuration class marked with `@Configuration` and `@EnableWebSecurity`.
  - **Key Setup**:
    - Disables CSRF (Stateless APIs don't need it like session-based apps do).
    - Configures `SessionCreationPolicy.STATELESS` (Server doesn't keep memory of users).
    - Defines which endpoints are public (`/api/auth/**`) and which are private.

> **🔥 Possible Interview Questions:**
> - **Q: Why do we use `SessionCreationPolicy.STATELESS`?**
>   - *A: Because we are using tokens. The server doesn't need to store a session ID in memory/database. The token itself contains the user identity. This makes the application easier to scale horizontally.*
> - **Q: What is the difference between `@Component` and `@Service`?**
>   - *A: Technically they are the same (stereotypes), but semantically `@Service` indicates business logic layer.*
> - **Q: How does the `AuthTokenFilter` verify the user?**
>   - *A: It parses the JWT signature using the secret key. If valid, it trusts the claims (username) inside.*

### 2. The Data Model (`com.example.issueflow.model`)
We use **JPA (Java Persistence API)** with Hibernate to map Java classes to Database tables.

- **`User.java`**: Represents the `users` table.
- **`Ticket.java`**: Represents `tickets`. Likely has a `@ManyToOne` relationship with `User` (Assignee/Reporter).
- **`Team.java`**: Represents groups of users.

> **🔥 Possible Interview Questions:**
> - **Q: Explain `@OneToMany` vs `@ManyToOne`.**
>   - *A: A User has many Tickets (One-To-Many). A Ticket belongs to one User (Many-To-One). usually, we own the relationship on the "Many" side (the Ticket calls the User).*
> - **Q: What is the difference between `Lazy` and `Eager` loading?**
>   - *A: Eager loads child data immediately (e.g., loading a Ticket loads the User). Lazy loads it only when accessed. Lazy is better for performance but can cause `LazyInitializationException` if the session is closed.*

### 3. Controllers (`com.example.issueflow.controller`)
The entry points for HTTP requests.

- **`AuthController.java`**: Handles login/signup. Uses `AuthenticationManager` to check username/password.
- **`TicketController.java`**: Manages ticket interactions.

---

## 🎨 Frontend Walkthrough (`frontend/src`)

The frontend is a **Single Page Application (SPA)** built with React.

### 1. State Management (`context/AuthContext.jsx`)
Instead of passing "user" props down 10 levels, we use **React Context**.
- **Role**: Holds the global `user` state and `token`.
- **Logic**: On load (`useEffect`), it checks if a user is saved in `localStorage`. If yes, it restores the session.

> **🔥 Possible Interview Questions:**
> - **Q: What is the difference between Context API and Redux?**
>   - *A: Context is built-in and great for low-velocity global data (like User, Theme). Redux is better for high-velocity complex state updates. For this app, Context is perfect.*
> - **Q: Why use `localStorage` for tokens? Is it safe?**
>   - *A: It's convenient but vulnerable to XSS (Cross-Site Scripting). Secure cookies are safer but harder to implement with decoupled frontends.*

### 2. Routing (`App.jsx` & `ProtectedRoute.jsx`)
- **`react-router-dom`**: Handles navigation without reloading the page.
- **`ProtectedRoute`**: A wrapper component.
  ```jsx
  if (!token) return <Navigate to="/login" />;
  return children;
  ```
  This prevents unauthenticated users from visiting URL `/dashboard` directly.

> **🔥 Possible Interview Questions:**
> - **Q: Explain the `useEffect` hook.**
>   - *A: It handles side effects (fetching data, subscriptions). The dependency array `[]` determines when it runs (mount vs update).*
> - **Q: What is the Virtual DOM?**
>   - *A: A lightweight copy of the UI kept in memory. React compares it with the real DOM and only updates what changed (Reconciliation).*

---

## 🧠 System Design & General Questions

### 1. Scalability
> **Q: How would you handle 1 million users on this app?**
> - *A: Cache frequent reads (Redis), Index database columns (SQL Indexing), Load Balance multiple backend instances (Easier because it's stateless!), Use generic CDN for frontend assets.*

### 2. Security
> **Q: How do you store passwords?**
> - *A: NEVER in plain text. We use **BCrypt** (salted hashing) via `PasswordEncoder` in Spring Security.*

### 3. API Design
> **Q: What makes an API "RESTful"?**
> - *A: Statelessness, Resource-based URLs (`/tickets` not `/getTickets`), Standard HTTP verbs (GET, POST, PUT, DELETE), Standard Status Codes (200, 404, 500).*
