# Admin & Report Service - Technical Review

This document provides an overview of the **Admin & Report Service** built with .NET 8 using **Clean Architecture** principles. This service acts as the operational hub for the Smart Clinic Appointment System.

## 🚀 Service Overview
- **Technology Stack**: .NET 8, Entity Framework Core (PostgreSQL), AWS SDK (S3).
- **Default Port**: `8088` (Configured in `launchSettings.json`).
- **Primary Goal**: Aggregating data from across the microservices network to provide actionable analytics and secure audit logging.

---

## 🏗️ Architecture Design
The service follows **Clean Architecture**, divided into four distinct projects:

### 1. Admin.Domain
The core of the application.
- **Entities**: Contains the `AuditLog` entity which defines the schema for tracking system access and PHI data interactions.

### 2. Admin.Application
Contains business logic interfaces and data structures.
- **Interfaces**: Defines API client interfaces (`IAppointmentApiClient`, `IBillingApiClient`) and storage interfaces.
- **DTOs**: Data Transfer Objects for handling incoming data from Java services and outgoing report responses.

### 3. Admin.Infrastructure
Handles external concerns like databases and external APIs.
- **Data**: Contains `AdminDbContext` for PostgreSQL integration.
- **HttpClients**: Concrete implementations that communicate with:
  - `Appointment Service` (Port 8084)
  - `Billing Service` (Port 8087)
- **Services**: Includes `S3ReportStorageService` for CSV exports to Amazon S3.

### 4. Admin.Api
The entry point of the service.
- **Controllers**: `AdminController` exposes the REST endpoints for User Management, Reports, and Audit Logs.
- **Program.cs**: Configures Dependency Injection, EF Core, and AWS S3 with a **safe-fail mechanism** for local development.

---

## 📊 Key Features

### 🛡️ Audit Logging
- **Endpoint**: `POST /admin/audit-log` & `GET /admin/audit-log`
- **Logic**: Stores granular logs of user actions. Supports filtering by actor, entity type, and action with built-in pagination.

### 📈 Real-time Analytics
- **Endpoints**: `/admin/reports/appointments`, `/revenue`, `/no-show-rate`
- **Logic**: Automatically fetches raw data from Java microservices and performs on-the-fly aggregation (e.g., calculating Doctor Utilization % and Revenue Sums).

### 📄 CSV Exporting
- **Endpoint**: `GET /admin/reports/export`
- **Logic**: Generates CSV files from report data and uploads them to **Amazon S3**. Returns a pre-signed URL valid for 1 hour.
- **Note**: If AWS keys are not provided, the service automatically enters **Mock Mode** to prevent crashes.

---

## 🛠️ Getting Started for Teammates

### 1. Database Setup
Ensure PostgreSQL is running, then apply the migrations:
```powershell
cd backend/AdminService
dotnet ef database update -p Admin.Infrastructure -s Admin.Api
```

### 2. Configuration
The `appsettings.json` in `Admin.Api` contains the connection string. Update the `Password` if your local PostgreSQL setup differs from `123`.

### 3. Running the Service
```powershell
dotnet run --project Admin.Api
```
Access the Swagger UI at: `http://localhost:8088/swagger`

---

## 📝 Important Notes
- **Inter-service dependencies**: For the reporting features to work, the **Appointment Service (:8084)** and **Billing Service (:8087)** must be online.
- **Authentication**: The service is prepared for JWT Authentication. The `[Authorize]` attributes are currently commented out to allow for easier initial testing.
