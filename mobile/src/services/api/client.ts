import { ENV }       from "@/constants/env";
import { useAuthStore } from "@/store/auth.store";

// ── Types ──────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:   boolean;
  data?:     T;
  error?:    string;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public raw?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Request helpers ────────────────────────────────────────
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?:  Method;
  body?:    unknown;
  params?:  Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${ENV.API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, params, headers = {} } = options;

  const url      = buildUrl(path, params);
  const authUser = useAuthStore.getState().user;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": authUser?.id ?? "",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse JSON regardless of status code
  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, "Invalid JSON response from server");
  }

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.error ?? "Request failed", json);
  }

  return json.data as T;
}

// ── Convenience methods ────────────────────────────────────
export const api = {
  get:    <T>(path: string, params?: RequestOptions["params"]) =>
            request<T>(path, { method: "GET", params }),
  post:   <T>(path: string, body: unknown) =>
            request<T>(path, { method: "POST", body }),
  patch:  <T>(path: string, body: unknown) =>
            request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) =>
            request<T>(path, { method: "DELETE" }),
};
