"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addUser,
  deleteUser,
  findUserByEmail,
  getUser,
  getUsers,
  updateUserRecord,
  type AppUser,
} from "@/lib/users";

interface AuthContextType {
  user: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (
    email: string,
    password: string,
    fullName?: string,
    avatar?: string
  ) => Promise<boolean>;
  updateUser: (userData: Partial<AppUser>) => Promise<void>;
  isAdmin: boolean;
  getTeamMembers: () => Promise<AppUser[]>;
  updateUserRole: (
    userId: string,
    newRole: "admin" | "member"
  ) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  inviteUser: (email: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = "auth-token";

function setAuthCookie(userId: string) {
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const allUsers = await getUsers();
        if (cancelled) return;
        setUsers(allUsers);

        const cookieId = getAuthCookie();
        const storedUser =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const storedId = storedUser
          ? (JSON.parse(storedUser) as AppUser).id
          : null;
        const sessionId = cookieId || storedId;

        if (sessionId) {
          const sessionUser =
            (await getUser(sessionId)) ??
            allUsers.find((item) => item.id === sessionId);
          if (cancelled) return;
          if (sessionUser) {
            setUser(sessionUser);
            localStorage.setItem("user", JSON.stringify(sessionUser));
            setAuthCookie(sessionUser.id);
          } else {
            localStorage.removeItem("user");
            removeAuthCookie();
          }
        } else {
          removeAuthCookie();
        }
      } catch (error) {
        console.error("Failed to hydrate auth:", error);
        if (!cancelled) {
          localStorage.removeItem("user");
          removeAuthCookie();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const foundUser = await findUserByEmail(email);
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      setAuthCookie(foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    removeAuthCookie();
    router.push("/login");
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string = "",
    avatar: string = ""
  ) => {
    const created = await addUser({
      email,
      password,
      fullName,
      avatar,
      role: "member",
    });
    const updatedUsers = [...users, created];
    setUsers(updatedUsers);
    setUser(created);
    localStorage.setItem("user", JSON.stringify(created));
    setAuthCookie(created.id);
    return true;
  };

  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    await updateUserRecord(updatedUser);
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUsers(users.map((item) => (item.id === user.id ? updatedUser : item)));
  };

  const isAdmin = user?.role === "admin";

  const getTeamMembers = async (): Promise<AppUser[]> => {
    const latest = await getUsers();
    setUsers(latest);
    return latest;
  };

  const updateUserRole = async (
    userId: string,
    newRole: "admin" | "member"
  ): Promise<void> => {
    const target = users.find((item) => item.id === userId);
    if (!target) return;
    const updated = { ...target, role: newRole };
    await updateUserRecord(updated);
    setUsers(users.map((item) => (item.id === userId ? updated : item)));
  };

  const removeUser = async (userId: string): Promise<void> => {
    await deleteUser(userId);
    setUsers(users.filter((item) => item.id !== userId));
  };

  const inviteUser = async (email: string): Promise<void> => {
    const created = await addUser({
      email,
      fullName: "",
      avatar: "",
      role: "member",
    });
    setUsers([...users, created]);
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
