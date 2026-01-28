# IssueFlow

**IssueFlow** is a modern, full-stack incident and issue tracking system designed for teams to manage tasks, bugs, and workflows efficiently. It features a robust Spring Boot backend and a responsive React frontend, packaged together for easy deployment.

## 🚀 Features

- **User Authentication**: Secure Signup/Login with JWT-based authentication.
- **Team Management**:
  - Create and manage teams.
  - Invite members via email.
  - Role-based access (Admin/Member).
- **Ticket Management**:
  - Create, edit, and track incidents.
  - Set priorities (Low, Medium, High) and status (Open, In Progress, Closed).
  - Assign tickets to team members or specific teams.
  - Attach files and view detailed history.
- **Dashboard**:
  - Overview of open tickets and team activities.
  - Filter views by 'All Tickets' or 'My Team'.
- **Modern UI**:
  - Clean, industrial-standard design using a slate/indigo color palette.
  - Responsive layout built with CSS variables for easy theming.

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.3.2**
  - Spring Web (REST API)
  - Spring Security (JWT Auth)
  - Spring Data JPA
  - SpringDoc OpenAPI (Swagger UI)
- **Database**: H2 (Dev/Test) / PostgreSQL (Production ready)
- **Build Tool**: Maven

### Frontend
- **React 18**
- **Vite** (Build tool)
- **React Router DOM** (Routing)
- **Axios** (API requests)
- **Lucide React** (Icons)
- **Date-fns** (Date formatting)

## 📋 Prerequisites

- **Java Development Kit (JDK) 17** or higher.
- **Node.js** (v18+ recommended) - *Required only for local frontend development*.
- **Docker** (Optional, for containerized deployment).

## 🏃‍♂️ How to Run

### Option 1: Development Mode (Split)
Run frontend and backend separately for a faster development cycle.

**1. Backend**
```bash
# From the project root
./mvnw spring-boot:run
```
The backend API will start at `http://localhost:8080`.

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

### Option 2: Production Build (Unified)
Bundle the frontend into the backend and run as a single JAR file.

```bash
# From the project root
./mvnw clean install
java -jar target/issueflow-0.0.1-SNAPSHOT.jar
```
Access the application at `http://localhost:8080`.

---

### Option 3: Docker
Build and run the application as a Docker container.

```bash
# Build the image
docker build -t issueflow .

# Run the container
docker run -p 8080:8080 issueflow
```
Access the application at `http://localhost:8080`.

## 📂 Project Structure

```
issueflow/
├── frontend/               # React Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── src/                    # Spring Boot Backend
│   ├── main/java/com/example/issueflow/
│   │   ├── config/         # Security & Web Config
│   │   ├── controller/     # REST Controllers
│   │   ├── model/          # JPA Entities
│   │   ├── repository/     # Data Access
│   │   ├── service/        # Business Logic
│   │   └── security/       # JWT Implementation
│   └── main/resources/
│       └── application.properties
├── Dockerfile              # Docker Configuration
├── pom.xml                 # Maven Configuration
└── README.md               # Project Documentation
```

## 🔌 API Documentation

Once the backend is running, you can access the Swagger UI documentation at:
**[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

## 🛡️ License

This project is licensed under the MIT License.
