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
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const res = await fetch(queryKey[0] as string, {
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  await throwIfResNotOk(res);
  return await res.json();
};

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
      queryFn: defaultQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      staleTime: 1000 * 60 * 15, // 15 minutes - cache data longer
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
      retry: 1
    },
    mutations: {
      retry: 1,
    },
  },
});
