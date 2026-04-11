import { Platform } from "react-native";
import { getDeviceHeaders } from "./deviceHeaders";

type RequestOptions = {
  baseUrl: string;
  token?: string;
  method?: "GET" | "POST" | "PUT";
  path: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
};

type ErpApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  timestamp?: string;
};

type ErrorPayload = {
  message?: string;
  error?: string;
  code?: string;
};

type RetryTokenResolver = (context: { baseUrl: string; token?: string }) => Promise<string | null>;

let retryTokenResolver: RetryTokenResolver | null = null;

export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message ?? "Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export function setRetryTokenResolver(resolver: RetryTokenResolver | null) {
  retryTokenResolver = resolver;
}

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

function isAuthFailure(status: number, payload?: ErrorPayload) {
  if (status === 401) {
    return true;
  }
  if (status !== 403) {
    return false;
  }
  const text = `${payload?.message ?? ""} ${payload?.error ?? ""} ${payload?.code ?? ""}`.toLowerCase();
  return (
    text.includes("token") ||
    text.includes("jwt") ||
    text.includes("expired") ||
    text.includes("unauthorized") ||
    text.includes("not authenticated") ||
    text.includes("invalid credentials")
  );
}

async function request<T>({ baseUrl, token, method = "GET", path, query, body, headers }: RequestOptions): Promise<T> {
  const url = `${normalizeBaseUrl(baseUrl)}${buildUrl(path, query)}`;
  const deviceHeaders = await getDeviceHeaders();
  const requestBody = body ? JSON.stringify(body) : undefined;

  const execute = async (activeToken?: string) =>
    fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(requestBody ? { "Content-Type": "application/json" } : {}),
      ...deviceHeaders,
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      ...headers,
    },
    body: requestBody,
  });

  let response = await execute(token);

  if (!response.ok && retryTokenResolver && token) {
    let payload: ErrorPayload | undefined;
    try {
      payload = (await response.json()) as ErrorPayload;
    } catch {}
    if (isAuthFailure(response.status, payload)) {
      const nextToken = await retryTokenResolver({ baseUrl: normalizeBaseUrl(baseUrl), token });
      if (nextToken && nextToken !== token) {
        response = await execute(nextToken);
      }
    }
  }

  if (!response.ok) {
      let message = `${response.status} ${response.statusText}`;
      let payload: ErrorPayload | undefined;
      try {
        payload = (await response.json()) as ErrorPayload;
        message = payload.message ?? payload.error ?? message;
      } catch {}
      if (isAuthFailure(response.status, payload)) {
        throw new UnauthorizedError(message);
      }
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
