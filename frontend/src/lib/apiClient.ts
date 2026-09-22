import Cookies from "js-cookie";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location?.hostname
  ) {
    return `http://${window.location.hostname}:4000`;
  }
  return "http://localhost:4000";
}

export const fetchApi = async (
  url: string,
  options: RequestInit = {},
  retries: number = 1,
): Promise<Response> => {
  const token = Cookies.get("auth-token");
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Clean any accidental double slashes (e.g. https://domain.com//api -> https://domain.com/api)
  const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");

  // Create an internal timeout controller if caller didn't provide their own signal
  let timeoutId: any;
  let signal = options.signal;
  if (!signal && typeof AbortController !== "undefined") {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds safe timeout
    signal = controller.signal;
  }

  try {
    const res = await fetch(cleanUrl, {
      ...options,
      headers,
      signal,
    });
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);

    // Auto-retry once on transient network errors (e.g. Wi-Fi glitch or packet drop)
    const isNetworkError =
      error?.name === "TypeError" ||
      error?.name === "AbortError" ||
      error?.message?.includes("Failed to fetch") ||
      error?.message?.includes("network");

    if (isNetworkError && retries > 0) {
      await new Promise((r) => setTimeout(r, 300));
      return fetchApi(url, options, retries - 1);
    }
    throw error;
  }
};
