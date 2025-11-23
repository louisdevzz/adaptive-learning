'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, profileAPI } from '@/lib/api';
import type { User, Profile, LoginCredentials, RegisterData } from '@/types';
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount using cookie-based auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        // Fetch user and profile in parallel for faster loading
        const [currentUser, userProfile] = await Promise.all([
          authAPI.getCurrentUser(),
          profileAPI.getMyProfile(),
        ]);

        setUser(currentUser);
        setProfile(userProfile);
      } catch (error: any) {
        // User is not authenticated or token expired/revoked
        console.error('Failed to load user:', error);
        setUser(null);
        setProfile(null);

        // If token was revoked, the error message will contain this info
        // Clear any stale state to allow fresh login
        if (error.message?.includes('revoked') || error.message?.includes('Invalid')) {
          console.log('Token was revoked or invalid, cleared auth state');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Login - tokens will be set as HttpOnly cookies by the backend
      const response = await authAPI.login(credentials);

      setUser(response.user);

      // Fetch profile after login
      const userProfile = await profileAPI.getMyProfile();
      setProfile(userProfile);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Register - tokens will be set as HttpOnly cookies by the backend
      const response = await authAPI.register(data);

      setUser(response.user);

      // Fetch profile after registration
      const userProfile = await profileAPI.getMyProfile();
      setProfile(userProfile);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Logout - backend will clear HttpOnly cookies
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const userProfile = await profileAPI.getMyProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return(
    <AuthContext.Provider value={value}>
      <HeroUIProvider>
        <ToastProvider/>
          {children}
      </HeroUIProvider>
    </AuthContext.Provider>
  );
};
