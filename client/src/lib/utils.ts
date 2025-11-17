import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASE_URL = "https://4beac38c-34b4-47be-8df2-4a7d6f34c6b5-00-yd16h0ayqss7.pike.replit.dev"; // 👈 đổi theo domain backend của bạn

export async function defaultFetcher({ queryKey }) {
  const [path] = queryKey;

  // Cho phép truyền cả path hoặc URL đầy đủ
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const domain = localStorage.getItem("domain");

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Origin": domain ?? "",
    },
    credentials: "include", // nếu dùng cookie, giữ nguyên
  });

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

  return res.json();
}