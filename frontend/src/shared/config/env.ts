export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  APP_NAME: "Smart Clinic",
} as const;
