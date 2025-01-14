import React, { createContext, useMemo, useState } from 'react';

type AuthContextInterface = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

const initialState = {
  isLoggedIn: !!localStorage.getItem('accessToken'),
  setIsLoggedIn: () => {},
};

export const AuthContext = createContext<AuthContextInterface>(initialState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'));
  const value = useMemo(() => ({ isLoggedIn, setIsLoggedIn }), [isLoggedIn, setIsLoggedIn]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
