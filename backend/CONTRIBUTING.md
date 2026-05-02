# Contributing

## Role Registration Policy
- Patients self-register via `POST /api/auth/register` and are assigned the `Patient` role.
- Admins create staff accounts (`Doctor`, `Receptionist`) via `POST /api/users`.
- An initial admin account is seeded from configuration (`SeedAdmin`).