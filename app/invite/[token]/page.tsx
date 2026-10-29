import Link from "next/link";

type Props = {
    params: Promise<{ token: string }>;
    searchParams: Promise<{
        name?: string;
        inviter?: string;
    }>;
};

export default async function Invite({ params, searchParams }: Props) {
    const { token } = await params;
    const { name, inviter } = await searchParams;

    const { project, error } = await fetch("/api/invite_tokens", {
        method: "POST",
        body: JSON.stringify({
            token
        }),
    }).then(res => res.json());

    return (
        <div>
            {project ? (
                <>
                    <p>{inviter || "Someone"} invited you{name ? ` to become part of ${name}.` : "."}</p>
                    <Link href={"/projects/" + project}>Accept</Link>
                </>
            ) : (
                <p>An error occurred: {error}</p>
            )}
            <Link href="/">Return home</Link>
        </div>
    );
}