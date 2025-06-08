import React, { createContext, useEffect, useState, useContext } from "react";

type AuthContextType = any;

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState(undefined);

    return (
        <AuthContext.Provider value={session}>
            {children}
        </AuthContext.Provider>
    );
}

export const UserAuth = () => {
    return useContext(AuthContext);
}