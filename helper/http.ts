// Generic HTTP client for every page's services: http.get / post / put / patch / delete.
// Resolves with the parsed response body, and throws HttpError (helper/httpError.ts) when the
// server answers with an error status, can't be reached, or takes too long.
//
//   const { ticket } = await http.post<{ ticket: string }>(apiRoutes.contact, formData, "form");

import { HttpError } from "./httpError";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** json: a plain object, sent as JSON. form: FormData, sent as multipart. urlencoded: a flat object. */
type ContentType = "json" | "form" | "urlencoded";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  queryParams?: QueryParams;
  headers?: Record<string, string>;
  type?: ContentType;
  /** Milliseconds before the request is abandoned. */
  timeout?: number;
}

/** Empty by default: API routes are on the same origin as the pages. */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const DEFAULT_TIMEOUT = 15000;

const messages = {
  network: "Couldn't reach iOverlay. Check your connection and try again.",
  timeout: "iOverlay took too long to answer. Please try again.",
  server: "Something went wrong on our side. Please try again in a minute.",
  failed: "The request failed. Please try again.",
};

const getHeaders = (type: ContentType = "json", customHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { Accept: "application/json", ...customHeaders };

  // No Content-Type for form data: the browser adds it with the multipart boundary.
  if (type === "json") headers["Content-Type"] = "application/json";
  else if (type === "urlencoded") headers["Content-Type"] = "application/x-www-form-urlencoded";

  return headers;
};

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return "";
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const encodeBody = (body: unknown, type: ContentType): BodyInit => {
  if (type === "form") return body as FormData;
  if (type === "urlencoded") return new URLSearchParams(body as Record<string, string>).toString();
  return JSON.stringify(body);
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = DEFAULT_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new HttpError(messages.timeout, "TimeoutError", 0);
    throw new HttpError(messages.network, "NetworkError", 0, error);
  } finally {
    clearTimeout(id);
  }
};

/** Our API routes answer errors as { ok: false, error }; other servers often use { message }. */
const errorMessage = (data: unknown, status: number): string => {
  if (data && typeof data === "object") {
    const { error, message } = data as { error?: unknown; message?: unknown };
    if (typeof error === "string" && error) return error;
    if (typeof message === "string" && message) return message;
  }
  return status >= 500 ? messages.server : messages.failed;
};

const request = async <T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body, queryParams, headers = {}, type = "json", timeout } = options;

  const url = `${BASE_URL}${endpoint}${buildQueryString(queryParams)}`;

  const config: RequestInit = {
    method,
    headers: getHeaders(type, headers),
  };

  if (body !== undefined && method !== "GET") {
    config.body = encodeBody(body, type);
  }

  const response = await fetchWithTimeout(url, config, timeout);

  const contentType = response.headers.get("content-type");
  const data: unknown = contentType?.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    throw new HttpError(errorMessage(data, response.status), "HttpError", response.status, data);
  }

  return data as T;
};

export const http = {
  get: <T = unknown>(url: string, params?: QueryParams, headers?: Record<string, string>) =>
    request<T>(url, { method: "GET", queryParams: params, headers }),

  post: <T = unknown>(url: string, body?: unknown, type: ContentType = "json", headers?: Record<string, string>) =>
    request<T>(url, { method: "POST", body, type, headers }),

  put: <T = unknown>(url: string, body?: unknown, type: ContentType = "json", headers?: Record<string, string>) =>
    request<T>(url, { method: "PUT", body, type, headers }),

  patch: <T = unknown>(url: string, body?: unknown, type: ContentType = "json", headers?: Record<string, string>) =>
    request<T>(url, { method: "PATCH", body, type, headers }),

  delete: <T = unknown>(url: string, params?: QueryParams, headers?: Record<string, string>) =>
    request<T>(url, { method: "DELETE", queryParams: params, headers }),
};
