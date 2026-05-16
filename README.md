# Smart Clinic Appointment System

A robust, microservices-based healthcare management system designed for seamless clinic operations. This system handles everything from user authentication and doctor scheduling to appointment booking, medical visits, billing, and automated patient reminders.

## 🏗 Architecture Overview

The system is built using a **Microservices Architecture** with a mix of **Spring Boot (Java)** and **.NET 8** services. It uses **AWS RDS (PostgreSQL)** for data storage and **AWS EventBridge + SQS** for asynchronous notification handling.

### Core Services
- **ApiGateway (8080)**: Entry point for all requests. Handles routing and security filtering.
- **AuthService (5005)**: [.NET] Manages user identity, roles (Admin, Doctor, Patient, Receptionist), and JWT issuance.
- **AdminService (8088)**: [.NET] Handles administrative reporting and high-level dashboard data.
- **AppointmentService (8084)**: Core logic for booking, rescheduling, and waitlist management.
- **DoctorService (8082)**: Manages doctor profiles, specialties, and availability slots.
- **PatientService (8083)**: Handles patient profiles and medical history access.
- **VisitService (8085)**: Records medical visit details and generates digital prescriptions.
- **BillingService (8087)**: Automatically generates invoices based on completed visits.
- **NotificationService (8089)**: Asynchronously processes email/SMS reminders fetched from SQS.
- **Frontend (3000)**: React/Next.js application providing the user interface for patients and staff.

## 🔄 Data Flow & Notifications

### 1. Synchronous Flow (REST)
Most service-to-service communication happens via REST using internal Docker DNS names (e.g., `http://doctor-service:8082`).

### 2. Asynchronous Notification Flow
The system uses a "Delayed Trigger" pattern for reminders:
1.  **Appointment Booked**: `AppointmentService` creates an appointment in the DB.
2.  **Schedule Created**: It immediately calls **AWS EventBridge Scheduler** to create a one-time trigger (e.g., 24h before the appointment).
3.  **Target Triggered**: At the scheduled time, EventBridge pushes a message directly to an **AWS SQS Queue**.
4.  **Notification Sent**: the `NotificationService` listens to the SQS queue, picks up the message, and sends an email to the patient.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- AWS Account (for RDS, SQS, and EventBridge)
- Java 17+ (for local development)
- .NET 8 SDK (for local development)

### Environment Configuration (`.env`)
To run the project, create a `.env` file in each service directory (or a single root `.env` if using a script to propagate it). Below is the required template:

```env
# --- Database Settings ---
DB_HOST=database-1.cbskasaeej5i.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=123456789
DB_URL=jdbc:postgresql://database-1.cbskasaeej5i.eu-north-1.rds.amazonaws.com:5432/postgres

# --- Pool Settings ---
DB_MAX_POOL_SIZE=3
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=3

# --- Inter-Service URLs (Internal Docker DNS) ---
AUTH_SERVICE_URL=http://auth-service:8080
ADMIN_SERVICE_URL=http://admin-service:8080
PATIENT_SERVICE_URL=http://patient-service:8083
DOCTOR_SERVICE_URL=http://doctor-service:8082
APPOINTMENT_SERVICE_URL=http://appointment-service:8084
VISIT_SERVICE_URL=http://visit-service:8085
BILLING_SERVICE_URL=http://billing-service:8087
NOTIFICATION_SERVICE_URL=http://notification-service:8089

# --- JWT Settings ---
JWT_KEY=SmartClinicAppointmentSystemSuperSecretKey123!
JWT_ISSUER=ClinicAuthAPI
JWT_AUDIENCE=ClinicAuthClient

# --- Seed Admin ---
SEED_ADMIN_EMAIL=admin@clinic.com
SEED_ADMIN_PASSWORD=AdminPassword123!

# --- AWS Configuration (Required for Appointment & Notification Services) ---
AWS_ACCESS_KEY=<your-access-key>
AWS_SECRET_KEY=<your-secret-key>
AWS_REGION=eu-north-1
AWS_SQS_QUEUE_ARN=arn:aws:sqs:<region>:<account-id>:clinic-notification-queue
AWS_EVENTBRIDGE_ROLE_ARN=arn:aws:iam::<account-id>:role/eventbridge-scheduler-sqs-role

# --- Email Settings (Notification Service) ---
MAIL_USERNAME=<your-email>
MAIL_PASSWORD=<your-app-password>
```

> [!IMPORTANT]
> Ensure that all services have access to these variables, either via their own `.env` file or by passing them through the `docker compose` environment.

### Running with Docker

1.  **Build and Start Backend**:
    ```bash
    docker compose up --build -d
    ```
2.  **Build and Start Frontend**:
    ```bash
    docker compose -f docker-compose.frontend.yml up --build -d
    ```
3.  **Verify Status**:
    ```bash
    docker compose ps
    ```
4.  **Access the System**:
    - **Frontend**: http://localhost:3000 (if running)
    - **API Gateway**: http://localhost:8080
    - **Swagger UI**: http://localhost:8080/swagger-ui.html (via Gateway)

## 🛠 Deployment to AWS (EC2)
To deploy the backend to an EC2 instance:
1.  Copy the `docker-compose.yml` and all `.env` files to the server.
2.  Ensure the EC2 Security Group allows traffic on port `8080` (Gateway).
3.  Run `docker compose up -d`.

## 📝 Troubleshooting
- **DNS Issues**: Ensure all services are on the same Docker network (`clinic-network`).
- **Database Connection**: Verify that the RDS instance allows connections from the EC2/Local IP.
- **AWS Permissions**: The IAM User must have `AmazonSQSFullAccess` and `AmazonEventBridgeSchedulerFullAccess`.
