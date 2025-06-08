import React, { createContext, useEffect, useState, useContext } from "react";

import supabase from "~/utils/supabase"

type AuthContextType = any;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<any | null>(undefined);

    const signUpNewUser = async (email: string, password: string) => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error("There was a problem signing up: ", error);
            return { success: false, error };
        }

        return { success: true, data };
    }

    const signInUser = async (email: string, password: string) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) {
                console.error(error);
                return { success: false, error };
            }
            // signin success
            return { success: true, data };
        } catch (error) {
            console.error("An error occured: ", error);
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
    }, []);

    const signOut = () => {
        const error = supabase.auth.signOut();
        if (error) {
            console.error(error);
        }
    }

    return (
        <AuthContext.Provider value={{session, signUpNewUser, signInUser, signOut}}>
            {children}
        </AuthContext.Provider>
    );
}

export const UserAuth = () => {
    return useContext(AuthContext);
}