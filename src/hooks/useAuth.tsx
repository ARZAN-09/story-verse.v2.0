import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
         console.warn("Session error:", error.message);
         // If there's an invalid refresh token, log out entirely to clear the bad state
         supabase.auth.signOut();
      }
      handleUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
         console.log('Token refreshed gracefully');
      }
      handleUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUser = async (u: User | null) => {
    setUser(u);
    if (u) {
       let isUserAdmin = false;
       if (u.email?.toLowerCase() === 'www.arzan07@gmail.com') {
           isUserAdmin = true;
       }
       
       if (!isUserAdmin) {
           try {
               const { data, error } = await supabase.from('admins').select('*').eq('id', u.id).single();
               if (data && !error) {
                  isUserAdmin = true;
               }
           } catch (e) {
               console.warn("Could not fetch admin status:", e);
           }
       }
       setIsAdmin(isUserAdmin);
    } else {
       setIsAdmin(false);
    }
    setLoading(false);
  };

  return <AuthContext.Provider value={{ user, isAdmin, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
