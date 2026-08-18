"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Lecturer, UserRole } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { MOCK_LECTURER, MOCK_ADMIN } from "@/lib/mock/mockData";
import { schedulingApi } from "@/lib/api/services";

interface AuthContextType {
  user: User | null;
  lecturerProfile: Lecturer | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isAdmin: boolean;
  isLecturer: boolean;
  toggleDemoMode: (enabled?: boolean) => void;
  loginWithSupabase: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
  loginWithDemo: () => void;
  loginWithLecturerDemo: () => void;
  loginWithAdminDemo: () => void;
  switchPersona: (role: "lecturer" | "admin") => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<Lecturer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Helper getters
  const isAdmin = user?.role === "admin";
  const isLecturer = user?.role === "lecturer";

  const loginWithLecturerDemo = () => {
    setUser({
      id: MOCK_LECTURER.id,
      email: MOCK_LECTURER.email || "arthur.vance@university.ac.lk",
      role: "lecturer",
      status: "active",
      created_at: "2024-01-10T08:00:00Z",
    });
    setLecturerProfile(MOCK_LECTURER);
    setIsDemoMode(true);
  };

  const loginWithAdminDemo = () => {
    setUser({
      id: MOCK_ADMIN.id,
      email: MOCK_ADMIN.email,
      role: "admin",
      status: "active",
      created_at: "2023-01-01T00:00:00Z",
    });
    setLecturerProfile(null);
    setIsDemoMode(true);
  };

  const switchPersona = (role: "lecturer" | "admin") => {
    if (role === "admin") {
      loginWithAdminDemo();
    } else {
      loginWithLecturerDemo();
    }
  };

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const userRole = (session.user.user_metadata?.role as UserRole) || "lecturer";
          const authUser: User = {
            id: session.user.id,
            email: session.user.email || "lecturer@university.ac.lk",
            role: userRole,
            status: "active",
            created_at: session.user.created_at,
          };
          setUser(authUser);
          setIsDemoMode(false);

          if (userRole === "lecturer") {
            try {
              const profile = await schedulingApi.getLecturerProfile();
              setLecturerProfile(profile);
            } catch {
              setLecturerProfile(MOCK_LECTURER);
            }
          }
        } else {
          // Default to Demo Lecturer mode so dashboard is immediately interactive
          loginWithLecturerDemo();
        }
      } catch (err) {
        console.warn("Supabase session check failed, falling back to Demo Mode:", err);
        loginWithLecturerDemo();
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
            created_at: session.user.created_at,
          });
          setIsDemoMode(false);
          if (role === "lecturer") {
            const profile = await schedulingApi.getLecturerProfile();
            setLecturerProfile(profile);
          }
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
        const role = (data.user.user_metadata?.role as UserRole) || (email.includes("admin") ? "admin" : "lecturer");
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role,
          status: "active",
          created_at: data.user.created_at,
        });
        setIsDemoMode(false);

        if (role === "lecturer") {
          const profile = await schedulingApi.getLecturerProfile();
          setLecturerProfile(profile);
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

  const toggleDemoMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(nextState);
    if (nextState) {
      if (isAdmin) {
        loginWithAdminDemo();
      } else {
        loginWithLecturerDemo();
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setLecturerProfile(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        lecturerProfile,
        isLoading,
        isDemoMode,
        isAdmin,
        isLecturer,
        toggleDemoMode,
        loginWithSupabase,
        loginWithDemo: loginWithLecturerDemo,
        loginWithLecturerDemo,
        loginWithAdminDemo,
        switchPersona,
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

