# Smart Clinic Appointment System - Frontend

Welcome to the frontend repository for the Smart Clinic Appointment System. This application is built using modern web technologies and strictly follows the **Feature-Sliced Design (FSD)** architectural methodology.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16+ (App Router)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/icons)
- **Data Fetching & State**: [TanStack Query](https://tanstack.com/query/latest) (React Query), [Zustand](https://zustand-demo.pmnd.rs/) (Client State)
- **Architecture & Auth**: [Refine](https://refine.dev/) (Auth Provider, Access Control, Data Management)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Tables & Data Grids**: [TanStack Table](https://tanstack.com/table/latest) (DiceUI)
- **Charts**: [Recharts](https://recharts.org/)

## 🏗️ Folder Structure (Feature-Sliced Design)

This project organizes code according to **Feature-Sliced Design (FSD) v2.1**. It allows for highly scalable and maintainable frontends by enforcing unidirectional dependencies.

```text
src/
├── app/        # Application layer: Global providers, Next.js root layout, global styles
├── pages/      # Pages layer: Compositional layer to construct full pages from widgets
├── widgets/    # Widgets layer: Complex composite components combining features and entities
├── features/   # Features layer: User interactions and business actions (e.g., Auth, Filtering)
├── entities/   # Entities layer: Business entities (e.g., User, Patient, Doctor, Appointment)
└── shared/     # Shared layer: Reusable UI components, API clients, hooks, and utilities
```

### 📚 FSD Documentation
To understand how FSD works, especially within a Next.js environment, please read the official documentation:
- [FSD Official Concept Overview](https://feature-sliced.design/docs/get-started/overview)
- [Usage of FSD with Next.js App Router](https://feature-sliced.design/docs/guides/tech/nextjs)

**Important Rule:** Modules in a specific layer can only import from modules in the layers strictly below them. For example, a `feature` can import from `entities` and `shared`, but NEVER from `widgets` or `pages`.

## 🛠️ Spec-Driven Development

This project uses [Spec-Kit](https://github.com/github/spec-kit) to define and track feature implementation.

- All feature specifications are located in the `specs/` directory (e.g., `001-auth/`, `002-patient/`).
- The project's core principles and architectural decisions are defined in `.specify/constitution.md`.
- Missing endpoints and API mappings are tracked in `docs/specs/`.

If you are contributing a new feature, make sure to read the constitution and the respective spec document first.

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v20+) and `npm` installed.

### Installation

1. Clone the repository and navigate to the root directory.
2. Install the project dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the development server locally:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000). 
*Note: Ensure the backend API is running locally at `http://localhost:8080/api` for data fetching and authentication to work properly.*

### Building for Production

To create an optimized production build:
```bash
npm run build
npm run start
```

## 🤝 How to Contribute

1. **Check the Docs**: Read through `.specify/constitution.md` to understand the core principles of the project.
2. **Review the Specs**: Check the `specs/` directory to see the feature definitions and implementation tasks.
3. **Follow FSD Guidelines**: When creating new components or logic, make sure to place them in the correct FSD layer (`app`, `pages`, `widgets`, `features`, `entities`, or `shared`).
4. **Code Quality**: Keep components focused, write clean code (SOLID), and use proper TypeScript types. Ensure you run the linter before pushing changes:
   ```bash
   npm run lint
   ```
