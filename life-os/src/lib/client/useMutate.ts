"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { api } from "./api";

/** call(path, method, body) → JSON, then refreshes server data; errors become toasts. */
export function useMutate() {
  const router = useRouter();
  const toast = useToast();
  return useCallback(
    async <T = unknown,>(path: string, method: string, body?: unknown): Promise<T | null> => {
      try {
        const res = await api<T>(path, { method, body });
        router.refresh();
        return res;
      } catch (e) {
        toast({ message: e instanceof Error ? e.message : "Something went wrong", tone: "error" });
        return null;
      }
    },
    [router, toast],
  );
}
