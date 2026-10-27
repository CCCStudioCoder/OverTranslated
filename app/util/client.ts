'use client'

import { useCallback, useEffect, useState } from "react";
import {User} from "@/app/util/db";
import {useRouter} from "next/navigation";

export function useUser(url: string): [User, () => void] {
    const [user, setUser] = useState<User | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshUserData = useCallback(() => {
        setRefreshKey(key => key + 1);
    }, []);

    const router = useRouter();

    useEffect(() => {
        const controller = new AbortController();

        async function retrieve() {
            try {
                const res = await fetch("/api/auth/get_user_data", {
                    method: "POST",
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data: User = await res.json();
                setUser(data);
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error("Failed to retrieve user:", error);
                router.replace("/auth/login?url=" + url);
                router.refresh();
            }
        }

        void retrieve();

        return () => controller.abort();
    }, [refreshKey]);

    return [user!, refreshUserData];
}
