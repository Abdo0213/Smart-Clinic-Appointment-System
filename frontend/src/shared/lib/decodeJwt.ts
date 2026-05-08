interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  doctorId?: string;
  patientId?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}
