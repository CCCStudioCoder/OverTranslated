'use client'

import {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export type AwaitingRedirect = {
    searchParams: Promise<{
        url?: string;
    }>;
};

export default function Login({searchParams}: AwaitingRedirect) {
    const userRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [statusInfo, setStatusInfo] = useState("");

    const router = useRouter();

    return (
        <main>
            <h1>Creating an OverTranslated account</h1>
            <section>
                <label>Username</label>
                <input type="text" ref={userRef} />
            </section>
            <section>
                <label>Password</label>
                <input type="password" ref={passwordRef} />
            </section>
            <p style={{color: "red"}}>{statusInfo}</p>
            <button onClick={submit}>Submit</button>
            <Link href='./signin'>Create an account</Link>
        </main>
    );

    async function submit() {
        const user = userRef.current!.value;
        const pw = passwordRef.current!.value;

        const request = await (await fetch("/api/auth/check_auth", {
            method: "POST",
            body: JSON.stringify({
                user: user,
                password: pw,
            })
        })).json();

        if(request.error) {
            setStatusInfo(request.error);
        } else {
            router.replace((await searchParams).url || "/");
            router.refresh();
        }
    }
}