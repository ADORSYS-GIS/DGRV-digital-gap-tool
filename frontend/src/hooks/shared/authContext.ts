import React from "react";
import { AuthState } from "@/types/auth";

interface AuthHookState extends AuthState {
  login: () => void;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthHookState | undefined>(
  undefined
);