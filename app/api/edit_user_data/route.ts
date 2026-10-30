import {NextRequest, NextResponse} from "next/server";
import {createSession, validateSession} from "@/app/util/session";
import {dbError} from "@/app/util/db";
import {db} from "@/app/db";
import {userTable} from "@/app/db/schema";
import HttpStatusCode from "@/app/util/status-code";
import {eq, sql} from "drizzle-orm";
import {hash, verify} from "argon2";
import {cookies} from "next/headers";

export async function PATCH(req: NextRequest) {
    try {
        const { pseudo, oldPassword, newPassword, ghAPI: ghAppId, resetSession } = await req.json();

        const [error, validAuth, userData] = await validateSession();
        if(!validAuth) {
            return error;
        }

        if(Boolean(oldPassword) !== Boolean(newPassword)) { // Check if (not) both of neither exist
            return NextResponse.json({error: "To change your password, please provide old and new password"}, {status: HttpStatusCode.BAD_REQUEST});
        }

        const update: any = {};

        if(oldPassword) {
            const pwHash = userData!.password;
            if(!await verify(pwHash, oldPassword)) {
                return NextResponse.json({error: "Wrong password"}, {status: HttpStatusCode.UNAUTHORIZED});
            }
            update.password = await hash(newPassword);
        }

        if(pseudo) update.pseudo = pseudo;
        if(ghAppId) update.githubAppId = ghAppId;

        if(resetSession) {
            const newSession = createSession();

            const store = await cookies();
            store.set("session", await hash(newSession));

            update.sessionKey = newSession;
            update.sessionKeyCreation = Date.now();
        }

        await db.update(userTable)
            .set(update)
            .where(eq(userTable.id, userData!.id));

        return NextResponse.json({...update}, {status: HttpStatusCode.OK});
    } catch(e) {
        return dbError(e);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { project } = await req.json();

        if(typeof project !== "number") {
            return NextResponse.json({error: "Invalid project id"}, {status: HttpStatusCode.BAD_REQUEST});
        }

        const [error, validAuth] = await validateSession();
        if(!validAuth) {
            return error;
        }

        await db.update(userTable).set({
            projects: sql`array_append(${userTable.projects}, ${project})`
        })
    } catch(e) {
        return dbError(e);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { project, password } = await req.json();

        const [error, validAuth, userData] = await validateSession();
        if(!validAuth) {
            return error;
        }

        if(typeof password === "string") { // So it's the user you want to delete
            if(await verify(userData!.password, password)) {
                await db.delete(userTable).where(eq(userTable.id, userData!.id));
                return NextResponse.json({}, {status: HttpStatusCode.OK})
            }
            return NextResponse.json({error: "Wrong password"}, {status: HttpStatusCode.UNAUTHORIZED});
        }

        if(typeof project !== "number") {
            return NextResponse.json({error: "Invalid project id"}, {status: HttpStatusCode.BAD_REQUEST});
        }

        await db.update(userTable).set({
            projects: sql`array_remove(${userTable.projects}, ${project})`
        })
    } catch(e) {
        return dbError(e);
    }
}