'use client'

import {use, useCallback, useMemo, useState} from "react";
import {User} from "@/app/util/db";
import {useRouter} from "next/navigation";

export function useUser(url: string): [User, () => void] {
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshUserData = useCallback(() => {
        setRefreshKey(key => key + 1);
    }, []);

    const router = useRouter();

    const user = useMemo(async () => {
        try {
            const res = await fetch("/api/user_data", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data: User = await res.json();
            return data;
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
    }, [refreshKey]);

    return [use(user.then(user => user!)), refreshUserData];
}
