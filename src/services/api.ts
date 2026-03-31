import { Platform } from "react-native";

type RequestOptions = {
  baseUrl: string;
  token?: string;
  method?: "GET" | "POST" | "PUT";
  path: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
};

type ErpApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  timestamp?: string;
};

export function normalizeBaseUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return detectDefaultBaseUrl();
  }
  return trimmed.replace(/\/+$/, "");
}

export function detectDefaultBaseUrl() {
  return "http://localhost:8080";
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

async function request<T>({ baseUrl, token, method = "GET", path, query, body }: RequestOptions): Promise<T> {
  const url = `${normalizeBaseUrl(baseUrl)}${buildUrl(path, query)}`;
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function authRequest<T>(options: RequestOptions) {
  return request<T>(options);
}

export async function erpRequest<T>(options: RequestOptions) {
  const payload = await request<ErpApiResponse<T>>(options);
  return payload.data;
}

export async function dashboardRequest<T>(options: RequestOptions) {
  return request<T>(options);
}
