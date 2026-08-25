/* eslint-disable @typescript-eslint/no-explicit-any */
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
  loginWithSupabase: (email:string,password:string)=>Promise<{error:string|null;role?:UserRole}>;
  logout: ()=>Promise<void>;
}
const AuthContext=createContext<AuthContextType|undefined>(undefined);

function userFromBackend(data:any): User {
  return {
    id:data.id,
    email:data.email || data.username,
    role:data.role as UserRole,
    status:data.status,
    is_active:data.is_active,
    user_metadata:{},
    created_at:data.created_at,
    updated_at:data.updated_at,
  };
}

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [user,setUser]=useState<User|null>(null);
  const [lecturerProfile,setLecturerProfile]=useState<Lecturer|null>(null);
  const [isLoading,setIsLoading]=useState(true);
  const isAdmin=user?.role==="admin"; const isLecturer=user?.role==="lecturer";

  const syncSession=async()=>{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){setUser(null);setLecturerProfile(null);return;}
    try {
      const backendUser=await schedulingApi.getCurrentUser();
      setUser(userFromBackend(backendUser));
      if(backendUser.role==="lecturer") setLecturerProfile(await schedulingApi.getLecturerProfile());
      else setLecturerProfile(null);
    } catch (error) {
      await supabase.auth.signOut(); setUser(null); setLecturerProfile(null);
      throw error;
    }
  };

  useEffect(()=>{
    let active=true;
    syncSession().catch(()=>{}).finally(()=>{if(active)setIsLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==="SIGNED_OUT"){setUser(null);setLecturerProfile(null);setIsLoading(false);return;}
      if(event==="SIGNED_IN" || event==="TOKEN_REFRESHED") syncSession().catch(()=>{});
    });
    return()=>{active=false;subscription.unsubscribe();};
  },[]);

  const loginWithSupabase=async(email:string,password:string)=>{
    setIsLoading(true);
    try {
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error) return {error:error.message};
      if(!data.user) return {error:"Authentication failed"};
      try {
        const backendUser=await schedulingApi.getCurrentUser();
        if(backendUser.status!=="active" || backendUser.is_active===false) {
          await supabase.auth.signOut(); return {error:"This account is not active."};
        }
        setUser(userFromBackend(backendUser));
        if(backendUser.role==="lecturer") setLecturerProfile(await schedulingApi.getLecturerProfile());
        else setLecturerProfile(null);
        return {error:null,role:backendUser.role as UserRole};
      } catch(e) {
        await supabase.auth.signOut();
        return {error:e instanceof Error?e.message:"Backend authorization failed"};
      }
    } catch(e){ return {error:e instanceof Error?e.message:"Failed to log in"}; }
    finally{setIsLoading(false);}
  };
  const logout=async()=>{await supabase.auth.signOut();setUser(null);setLecturerProfile(null);};
  return <AuthContext.Provider value={{user,lecturerProfile,isLoading,isAdmin,isLecturer,loginWithSupabase,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const c=useContext(AuthContext); if(!c) throw new Error("useAuth must be used within AuthProvider"); return c;}
