'use client'

export default function Settings() {
    return (
        <div>
            <h1>Account settings</h1>
            <section>
                <h2>User name</h2>
                <input type="text" />
            </section>
            <section>
                <h2>Password</h2>
                <label htmlFor="oPw">Old password</label>
                <input type="password" name="oPw" />
                <label htmlFor="nPw">New password</label>
                <input type="password" name="nPw" />
            </section>
            <section>
                <h2>GitHub API token</h2>
                <input type="text" />
            </section>
            <button>Save</button>
            <button>Cancel</button>
            <section>
                <button>Reset session</button>
                <button>Log out</button>
                <button>Delete account</button>
            </section>
        </div>
    );
}