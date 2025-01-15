import { createContext } from 'react';
import { AuthContextValue } from './types';

const initialState = {
  isLoggedIn: !!localStorage.getItem('accessToken'),
  setIsLoggedIn: () => {},
};

export const AuthContext = createContext<AuthContextValue>(initialState);
