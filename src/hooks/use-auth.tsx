"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

/* -------------------- TYPES -------------------- */

interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "ceo" | "teacher" | "student" | "partner";
  teacherId?: number;
  studentId?: number;
  partnerProfileId?: number;
  phone?: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

/* -------------------- CONTEXT -------------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------- PROVIDER -------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  // alias (for compatibility with your components)
  const refetch = refresh;

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refresh,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* -------------------- HOOK -------------------- */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
