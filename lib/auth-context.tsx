"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar: string;
  role: "admin" | "member";
  emailVerified?: boolean;
  password?: string; // For demo purposes only - never do this in production!
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (
    email: string,
    password: string,
    fullName?: string,
    avatar?: string
  ) => boolean;
  updateUser: (userData: Partial<User>) => void;
  isAdmin: boolean;
  getTeamMembers: () => Promise<User[]>;
  updateUserRole: (
    userId: string,
    newRole: "admin" | "member"
  ) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  inviteUser: (email: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie helpers
const AUTH_COOKIE_NAME = "auth-token";

function setAuthCookie(userId: string) {
  // Set cookie with 7 day expiry, accessible by middleware
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${AUTH_COOKIE_NAME}=${userId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

function getAuthCookie(): string | null {
  const match = document.cookie.match(
    new RegExp(`(^| )${AUTH_COOKIE_NAME}=([^;]+)`)
  );
  return match ? match[2] : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUsers = localStorage.getItem("users");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Ensure cookie is in sync with localStorage
      setAuthCookie(parsedUser.id);
    } else {
      // No user in localStorage - ensure cookie is cleared too
      // This handles the case where cookie exists but localStorage was cleared
      removeAuthCookie();
    }

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with the default admin user
      const defaultUsers = [
        {
          id: "1",
          email: "prj-anip7v@qatech.email",
          fullName: "Sarah Chen",
          avatar: "",
          role: "admin" as const,
          password: "testingpassword",
        },
        {
          id: "2",
          email: "james.morrison@example.com",
          fullName: "James Morrison",
          avatar: "",
          role: "admin" as const,
          password: "testingpassword",
        },
        {
          id: "3",
          email: "elena.vasquez@example.com",
          fullName: "Elena Vasquez",
          avatar: "",
          role: "member" as const,
          password: "testingpassword",
        },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("users", JSON.stringify(defaultUsers));
    }

    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Case-insensitive email comparison
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      // Set auth cookie for middleware
      setAuthCookie(foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Remove auth cookie
    removeAuthCookie();
    router.push("/login");
  };

  const signup = (
    email: string,
    password: string,
    fullName: string = "",
    avatar: string = ""
  ) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      fullName,
      avatar,
      role: "member" as const,
      password,
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setUser(newUser);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("user", JSON.stringify(newUser));
    // Set auth cookie for middleware
    setAuthCookie(newUser.id);
    return true;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Also update the user in the users array
      const updatedUsers = users.map((u) =>
        u.id === user.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }
  };

  const isAdmin = user?.role === "admin";

  const getTeamMembers = async (): Promise<User[]> => {
    return users;
  };

  const updateUserRole = async (
    userId: string,
    newRole: "admin" | "member"
  ): Promise<void> => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const removeUser = async (userId: string): Promise<void> => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const inviteUser = async (email: string): Promise<void> => {
    // In a real application, this would be an API call
    console.log(`Invited user ${email} to the team`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        signup,
        updateUser,
        isAdmin,
        getTeamMembers,
        updateUserRole,
        removeUser,
        inviteUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
