import {randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {db} from "@/app/db";
import {userTable} from "@/app/db/schema";
import {verify} from "argon2";
import {dbError, User} from "@/app/util/db";

export function createSession() {
    return randomBytes(32).toString("hex");
}

export function checkExpire(creation: number) {
    return creation + 1000 * 60 * 60 * 24 * 30 < Date.now();
}

export async function validateSession(): Promise<[NextResponse, boolean, User?]> {
    try {
        const session = (await cookies()).get("session");

        if(typeof session !== "string") {
            return [NextResponse.json({error: "Session required"}, {status: 400}), false];
        }

        const userSearch: User[] = (await db.select().from(userTable)) // There should be always 0 or 1 element here
            .filter(async user => await verify(user.sessionKey, session));

        if(userSearch.length == 0) {
            return [NextResponse.json({error: "Invalid session"}, {status: 401}), false];
        }
        if(checkExpire(userSearch[0].sessionKeyCreation)) {
            return [NextResponse.json({error: "Old session"}, {status: 401}), false];
        }

        return [NextResponse.json({...userSearch[0]}, {status: 200}), true, userSearch[0]];
    }

    catch(e) {
        return [dbError(e), false];
    }
}