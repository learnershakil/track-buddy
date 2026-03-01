import { api } from "./client";

export interface BackendUser {
  id:            string;
  name:          string | null;
  email:         string;
  phone:         string | null;
  walletAddress: string | null;
  createdAt:     string;
}

export interface CreateUserPayload {
  name:  string;
  email: string;
  phone?: string;
}

export interface UpdateUserPayload {
  name?:          string;
  phone?:         string;
  walletAddress?: string;
}

const BASE = "/api/users";

export const usersService = {
  create: (payload: CreateUserPayload) =>
    api.post<BackendUser>(BASE, payload),

  getById: (id: string) =>
    api.get<BackendUser>(`${BASE}/${id}`),

  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<BackendUser>(`${BASE}/${id}`, payload),
};
