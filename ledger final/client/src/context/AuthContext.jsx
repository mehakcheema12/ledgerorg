import React, { createContext, useState, useCallback, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  }, []);

  const register = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  const updateProfile = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
