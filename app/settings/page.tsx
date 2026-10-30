'use client'

import {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useUser} from "@/app/util/client";

export default function Settings() {
    const userRef = useRef<HTMLInputElement>(null);
    const newPwRef = useRef<HTMLInputElement>(null);
    const oldPwRef = useRef<HTMLInputElement>(null);
    const cfPwRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    const [statusInfo, setStatusInfo] = useState("");
    const [deletePopup, setDeletePopup] = useState(false);

    const username = useUser("/settings")[0].pseudo;

    return (
        <div>
            <h1>Account settings</h1>
            <section>
                <h2>User name</h2>
                <input type="text" ref={userRef} value={username} />
            </section>
            <fieldset>
                <h2>Password</h2>
                <label htmlFor="oPw">Old password</label>
                <input type="password" name="oPw" ref={oldPwRef} />
                <label htmlFor="nPw">New password</label>
                <input type="password" name="nPw" ref={newPwRef} />
            </fieldset>
            <p>{statusInfo}</p>
            <fieldset>
                <a href="https://github.com/apps/spaceship-translate/installations/new/">Connect to GitHub app</a>
                <button onClick={updateSettings}>Save</button>
                <button onClick={router.refresh}>Abort</button>
            </fieldset>
            <fieldset>
                <button onClick={() => session(true)}>Reset session</button>
                <button onClick={() => session(false)}>Log out</button>
                <button onClick={() => setDeletePopup(true)}>Delete account</button>
            </fieldset>
            {deletePopup && (
                <div>
                    <p>Do you really want to delete your account? Enter your password to confirm.</p>
                    <input type="password" name="confirmPw" ref={cfPwRef} />
                    <button onClick={() => setDeletePopup(false)}>Cancel</button>
                    <button onClick={deleteAccount}>Confirm</button>
                </div>
            )}
        </div>
    );

    async function updateSettings() {
        const { error } = await fetch("/api/user_data", {
            method: "PATCH",
            body: JSON.stringify({
                name: userRef.current!.value,
                oldPassword: oldPwRef.current!.value,
                newPassword: oldPwRef.current!.value,
            })
        }).then(res => res.json());

        if (error) {
            setStatusInfo("Error: " + error);
        } else {
            setStatusInfo("Settings successfully updated!");
        }
    }

    async function session(recreate: boolean) {
        const { error } = await fetch("/api/auth/delete_session", {
            method: "DELETE",
            body: JSON.stringify({recreate})
        }).then(res => res.json());

        if (error) {
            setStatusInfo("Error: " + error);
        } else {
            router.refresh();
        }
    }

    async function deleteAccount() {
        const { error } = await fetch("/api/user_data", {
            method: "DELETE",
            body: JSON.stringify({
                password: cfPwRef.current!.value,
            })
        }).then(res => res.json());

        if(error) {
            setStatusInfo("Error: " + error);
            setDeletePopup(false);
        } else {
            router.replace("/");
            router.refresh();
        }
    }
}