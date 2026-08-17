"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Lecturer } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { MOCK_LECTURER } from "@/lib/mock/mockData";
import { schedulingApi } from "@/lib/api/services";

interface AuthContextType {
  user: User | null;
  lecturerProfile: Lecturer | null;
  isLoading: boolean;
  isDemoMode: boolean;
  toggleDemoMode: (enabled?: boolean) => void;
  loginWithSupabase: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<Lecturer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const authUser: User = {
            id: session.user.id,
            email: session.user.email || "lecturer@university.ac.lk",
            role: (session.user.user_metadata?.role as any) || "lecturer",
            status: "active",
            created_at: session.user.created_at,
          };
          setUser(authUser);
          setIsDemoMode(false);

          try {
            const profile = await schedulingApi.getLecturerProfile();
            setLecturerProfile(profile);
          } catch {
            setLecturerProfile(MOCK_LECTURER);
          }
        } else {
          // Default to Demo Lecturer mode so dashboard is immediately interactive
          loginWithDemo();
        }
      } catch (err) {
        console.warn("Supabase session check failed, falling back to Demo Mode:", err);
        loginWithDemo();
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
          setUser({
            id: session.user.id,
            email: session.user.email || "lecturer@university.ac.lk",
            role: (session.user.user_metadata?.role as any) || "lecturer",
            status: "active",
            created_at: session.user.created_at,
          });
          setIsDemoMode(false);
          const profile = await schedulingApi.getLecturerProfile();
          setLecturerProfile(profile);
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
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role: "lecturer",
          status: "active",
          created_at: data.user.created_at,
        });
        setIsDemoMode(false);
        const profile = await schedulingApi.getLecturerProfile();
        setLecturerProfile(profile);
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || "Failed to log in" };
    }
  };

  const loginWithDemo = () => {
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

  const toggleDemoMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(nextState);
    if (nextState) {
      loginWithDemo();
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
        toggleDemoMode,
        loginWithSupabase,
        loginWithDemo,
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
