"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  status: boolean;
  info?: any;
}

// Cache key for user profile
const USER_PROFILE_KEY = "/auth/me";

// Fetcher function for SWR
const fetcher = async (): Promise<User> => {
  return await api.auth.getProfile();
};

export function useUser() {
  const router = useRouter();

  // Use SWR to fetch and cache user data
  // Options:
  // - revalidateOnFocus: false - Don't refetch when window gains focus
  // - revalidateOnReconnect: false - Don't refetch when network reconnects
  // - revalidateIfStale: false - Don't refetch if data is stale
  // - dedupingInterval: 5000 - Dedupe requests within 5 seconds
  // - keepPreviousData: true - Keep previous data while fetching new data
  const { data: user, error, isLoading, mutate: mutateUser } = useSWR<User>(
    USER_PROFILE_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      onError: (error) => {
        // If unauthorized, user will be redirected by axios interceptor
        console.error("Failed to fetch user profile:", error);
      },
    }
  );

  const logout = async () => {
    try {
      await api.auth.logout();
      // Clear cookie on frontend domain (cross-domain fix)
      await fetch("/api/auth/clear-cookie", { method: "POST" });
      // Clear SWR cache for user profile
      mutate(USER_PROFILE_KEY, null, { revalidate: false });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user: user || null,
    loading: isLoading,
    logout,
    mutate: mutateUser, // Expose mutate function for manual updates
  };
}

