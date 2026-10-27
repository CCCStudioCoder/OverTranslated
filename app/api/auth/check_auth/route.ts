import {db} from "@/app/db";
import {userTable} from "@/app/db/schema";
import {eq} from "drizzle-orm";
import {NextResponse} from "next/server";
import {dbError} from "@/app/util/db";
import {cookies} from "next/headers";
import {hash, verify} from "argon2";
import {checkExpire, createSession} from "@/app/util/session";

export async function POST(req: Request) {
    try{
        const { user, password } = await req.json();

        if(typeof user != "string" || typeof password != "string") {
            return NextResponse.json({error: "Bad request"}, {status: 400});
        }

        const userSearch = await db.select()
            .from(userTable)
            .where(eq(userTable.pseudo, user))
            .limit(1);

        if(userSearch.length == 0) {
            return NextResponse.json({error: "Cannot find such user"}, {status: 404});
        }

        if(!await verify(userSearch[0].password, password)) {
            return NextResponse.json({error: "Invalid password"}, {status: 401});
        }

        const sessionValid = !checkExpire(userSearch[0].sessionKeyCreation);
        const oldSession = sessionValid && userSearch[0].sessionKey;

        const session = oldSession || createSession();
        await db.update(userTable)
            .set({sessionKey: session, sessionKeyCreation: Date.now()})
            .where(eq(userTable.pseudo, user));

        const store = await cookies();
        store.set("session", await hash(session), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30
        });

        return NextResponse.json({...userSearch[0]}, {status: 200});
    } catch (e) {
        return dbError(e);
    }
}