import supabase from "~/utils/supabase";
import { fetchPermissionLevel } from "~/utils/data";
import React, { createContext, useEffect, useState, useContext } from "react";

type AuthContextType = {
  session: any | null;
  loading: boolean;
  permission: number;
  signUpNewUser: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  signInUser: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (!isMounted) return;
      
      setSession(data?.session ?? null);
      
      // Fetch permission level if user is authenticated
      if (data?.session?.user?.id) {
        try {
          const permissionLevel = await fetchPermissionLevel(data.session.user.id);
          if (isMounted) {
            setPermission(permissionLevel);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to fetch permission level:", error);
          }
          if (isMounted) {
            setPermission(0);
          }
        }
      } else {
        setPermission(0);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      
      // Update permission when auth state changes
      if (session?.user?.id) {
        try {
          const permissionLevel = await fetchPermissionLevel(session.user.id);
          if (isMounted) {
            setPermission(permissionLevel);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to fetch permission level:", error);
          }
          if (isMounted) {
            setPermission(0);
          }
        }
      } else {
        if (isMounted) {
          setPermission(0);
        }
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUpNewUser = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email: email, 
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      } });
    if (error) return { success: false, error };
    return { success: true, data };
  };

  const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error };
    return { success: true, data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
  };

  const value = React.useMemo(() => ({
    session,
    loading,
    permission,
    signUpNewUser,
    signInUser,
    signOut
  }), [session, loading, permission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth must be used within an AuthContextProvider");
  }
  return context;
};