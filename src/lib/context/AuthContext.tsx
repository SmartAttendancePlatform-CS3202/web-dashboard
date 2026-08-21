"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Lecturer, UserRole } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { schedulingApi } from "@/lib/api/services";

interface AuthContextType {
  user: User | null;
  lecturerProfile: Lecturer | null;
  isLoading: boolean;
  isAdmin: boolean;
  isLecturer: boolean;
  loginWithSupabase: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<Lecturer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper getters
  const isAdmin = user?.role === "admin";
  const isLecturer = user?.role === "lecturer";

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("demo_bypass_token");
          }
          const userRole = (session.user.user_metadata?.role as UserRole) || "lecturer";
          const authUser: User = {
            id: session.user.id,
            email: session.user.email || "lecturer@university.ac.lk",
            role: userRole,
            status: "active",
            user_metadata: session.user.user_metadata,
            created_at: session.user.created_at,
          };
          setUser(authUser);

          if (userRole === "lecturer") {
            try {
              const profile = await schedulingApi.getLecturerProfile();
              setLecturerProfile(profile);
            } catch {
              setLecturerProfile(null);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase session check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const role = (session.user.user_metadata?.role as UserRole) || "lecturer";
          setUser({
            id: session.user.id,
            email: session.user.email || "lecturer@university.ac.lk",
            role,
            status: "active",
            user_metadata: session.user.user_metadata,
            created_at: session.user.created_at,
          });
          if (role === "lecturer") {
            try {
              const profile = await schedulingApi.getLecturerProfile();
              setLecturerProfile(profile);
            } catch {
              setLecturerProfile(null);
            }
          }
        } else if (_event === "SIGNED_OUT") {
          setUser(null);
          setLecturerProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // ignore
    }
  }, []);

  const loginWithSupabase = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("demo_bypass_token");
        }
        const role = (data.user.user_metadata?.role as UserRole) || (email.includes("admin") ? "admin" : "lecturer");
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role,
          status: "active",
          user_metadata: data.user.user_metadata,
          created_at: data.user.created_at,
        });

        if (role === "lecturer") {
          try {
            const profile = await schedulingApi.getLecturerProfile();
            setLecturerProfile(profile);
          } catch {
            setLecturerProfile(null);
          }
        } else {
          setLecturerProfile(null);
        }

        setIsLoading(false);
        return { error: null, role };
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : "Failed to log in";
      return { error: message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("demo_bypass_token");
    }
    setUser(null);
    setLecturerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        lecturerProfile,
        isLoading,
        isAdmin,
        isLecturer,
        loginWithSupabase,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

