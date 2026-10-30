'use client'

import {useRef} from "react";

export default function Settings() {
    const userRef = useRef<HTMLInputElement>(null);
    const newPwRef = useRef<HTMLInputElement>(null);
    const oldPwRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <h1>Account settings</h1>
            <section>
                <h2>User name</h2>
                <input type="text" ref={userRef} />
            </section>
            <fieldset>
                <h2>Password</h2>
                <label htmlFor="oPw">Old password</label>
                <input type="password" name="oPw" ref={oldPwRef} />
                <label htmlFor="nPw">New password</label>
                <input type="password" name="nPw" ref={newPwRef} />
            </fieldset>
            <a href="https://github.com/apps/spaceship-translate/installations/new/">Connect to GitHub app</a>
            <button>Save</button>
            <button>Cancel</button>
            <fieldset>
                <button>Reset session</button>
                <button>Log out</button>
                <button>Delete account</button>
            </fieldset>
        </div>
    );
}