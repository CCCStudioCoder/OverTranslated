import {NextResponse} from "next/server";
import {db} from "@/app/db";
import {userTable} from "@/app/db/schema";
import {dbError} from "@/app/util/db";
import {cookies} from "next/headers";
import {hash} from "argon2";
import {eq} from "drizzle-orm";
import {createSession} from "@/app/util/session";

export async function POST(req: Request) {
    try {
        const { userName, password } = await req.json();

        if(typeof userName !== "string" || typeof password !== "string") {
            return NextResponse.json({error: "User name and password are required"}, {status: 400});
        }

        const forwardedFor = req.headers.get("x-forwarded-for");

        if(!forwardedFor) {
            return NextResponse.json({error: "Cannot find user's IP"}, {status: 401});
        }

        const ip = forwardedFor.split(",")[0].trim();

        const usersWithIP = await db.select()
            .from(userTable)
            .where(eq(userTable.ip, ip));

        if(usersWithIP.length > 0) {
            return NextResponse.json({error: "IP already used"}, {status: 401})
        }

        const session = createSession();

        await db.insert(userTable).values({
            pseudo: userName,
            password: await hash(password),
            ip: ip,
            sessionKey: session,
            sessionKeyCreation: Date.now()
        });

        const store = await cookies();
        store.set("session", await hash(session), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30
        });

        return NextResponse.json({session: session}, {status: 201});
    } catch(e) {
        return dbError(e);
    }
}