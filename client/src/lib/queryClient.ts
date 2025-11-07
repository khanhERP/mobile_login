import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get domain from localStorage
  const domain = localStorage.getItem("domain") || window.location.origin;
  console.log("domain apiRequest", domain);
  const headers: HeadersInit = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    "X-Tenant-Domain": domain, // Send domain as custom header
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data
      ? JSON.stringify(data, (key, value) => {
          if (value instanceof Date) {
            return { __type: "Date", value: value.toISOString() };
          }
          return value;
        })
      : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get domain from localStorage
    const domain = localStorage.getItem("domain") || window.location.origin;
    console.log("domain getQueryFn", domain);
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        "X-Tenant-Domain": domain, // Send domain as custom header
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        // Always get domain from localStorage and send as header
        const domain = localStorage.getItem("domain") || "";

        const response = await fetch(`${API_URL}/${queryKey[0]}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Domain": domain, // Send domain on every request
          },
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        return response.json();
      },
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000, // Giữ cache 10 phút
      refetchOnMount: false,
      refetchOnReconnect: true,
      networkMode: "online",
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});