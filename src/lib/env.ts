const trimEnv = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

export function getSessionSecret() {
  const secret = trimEnv(process.env.SESSION_SECRET);

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be configured in production.");
    }

    return "dev-session-secret-change-me-before-production";
  }

  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }

  return secret;
}

export function getAppUrl() {
  const explicit = trimEnv(process.env.NEXT_PUBLIC_APP_URL);
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
