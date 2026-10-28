import {NextRequest, NextResponse} from "next/server";
import HttpStatusCode from "@/app/util/status-code";
import {db} from "@/app/db";
import {projectTable} from "@/app/db/schema";
import {eq} from "drizzle-orm";
import {validateSession} from "@/app/util/session";
import {dbError, SUCCESSFUL} from "@/app/util/db";
import {verify} from "argon2";
import {hasRights} from "@/app/util/projects";

const INVALID_PROJECT = NextResponse.json({error: "Invalid project id"}, {status: HttpStatusCode.BAD_REQUEST});
export const PROJECT_NOT_FOUND = NextResponse.json({error: "No project found."}, {status: 404});
export const NO_PERMISSIONS = NextResponse.json({error: "You do not have permission to manage this project"}, {status: HttpStatusCode.UNAUTHORIZED})

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        if(typeof id !== "number") {
            return INVALID_PROJECT;
        }

        const projectSearch = await db.select()
            .from(projectTable)
            .where(eq(projectTable.id, id))
            .limit(1);

        if(projectSearch.length == 0) {
            return PROJECT_NOT_FOUND
        }

        const [sessionError, sessionValid] = await validateSession();

        return sessionValid ? NextResponse.json({...projectSearch[0]}, {status: HttpStatusCode.OK}) : sessionError;
    } catch(e) {
        return dbError(e);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        if(typeof body.id !== "number") {
            return INVALID_PROJECT;
        }

        const [error, sessionValid, userData] = await validateSession();
        if(!sessionValid) {
            return error;
        }

        const projectSearch = await db.select()
            .from(projectTable)
            .where(eq(projectTable.id, body.id))
            .limit(1);

        if(projectSearch.length == 0) return PROJECT_NOT_FOUND;
        if(!hasRights(userData!.id, projectSearch[0])) {
            return NO_PERMISSIONS;
        }

        const update: any = {};

        for(const prop of ["name", "desc", "ghOwner", "ghRepo", "isPublic", "requireCheck"]) {
            if(body[prop]) update[prop] = body[prop];
        }

        await db.update(projectTable).set(update).where(eq(projectTable.id, body.id));
        return SUCCESSFUL;
    } catch(e) {
        return dbError(e);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id, password } = await req.json();

        if(typeof id !== "number") {
            return INVALID_PROJECT;
        }

        const [error, sessionValid, userData] = await validateSession();
        if(!sessionValid) {
            return error;
        }

        const projectSearch = await db.select()
            .from(projectTable)
            .where(eq(projectTable.id, id))
            .limit(1);

        if(projectSearch.length == 0) return PROJECT_NOT_FOUND;
        if(!(await verify(userData!.password, password) && projectSearch[0].owner == userData!.id)) {
            return NO_PERMISSIONS;
        }

        await db.delete(projectTable).where(eq(projectTable.id, id));

        return SUCCESSFUL;
    } catch(e) {
        return dbError(e);
    }
}