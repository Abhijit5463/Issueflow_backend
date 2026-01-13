Issueflow – Issue Tracking System
A production-ready Issue Tracking REST API built using Java, Spring Boot, JPA, PostgreSQL, and Docker, deployed on Render with live Swagger documentation.
This project is a production-ready Issue Tracking system built using Java (Spring Boot) and React (Vite). It uses PostgreSQL for data persistence and is ready for cloud deployment on Render.

Features
Create, update, view, and delete issues (tickets)
RESTful API design with proper HTTP status codes
Input validation using Jakarta Validation (@NotBlank, @Size, etc.)
Global exception handling with meaningful error responses
PostgreSQL database integration using Spring Data JPA
Automatic table creation using Hibernate
Swagger/OpenAPI documentation
Dockerized application
Cloud deployment on Render
Environment-based configuration (no hardcoded secrets)

Tech Stack
Backend
Java 17
Spring Boot 3.x
Spring Data JPA
Hibernate
Jakarta Validation

Database
PostgreSQL (Render managed DB)
DevOps / Deployment
Docker (multi-stage build)
Render (Web Service + PostgreSQL)
Environment Variables for secrets

Documentation
Swagger / OpenAPI 3
