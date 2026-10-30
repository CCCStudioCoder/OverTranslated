import {NextRequest, NextResponse} from "next/server";
import HttpStatusCode from "@/app/util/status-code";
import {db} from "@/app/db";
import {projectTable, userTable} from "@/app/db/schema";
import {eq, sql} from "drizzle-orm";
import {validateSession} from "@/app/util/session";
import {dbError, SUCCESSFUL} from "@/app/util/db";
import {verify} from "argon2";
import {hasRights} from "@/app/util/projects";

const INVALID_PROJECT = NextResponse.json({error: "Invalid project request"}, {status: HttpStatusCode.BAD_REQUEST});
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

export async function PUT(req: NextRequest) {
    try {
        const { name, targetOwner, targetRepo, isPublic } = await req.json();

        if(typeof name !== "string" || typeof targetOwner !== "string" || typeof targetRepo !== "string" || typeof isPublic !== "boolean") {
            return INVALID_PROJECT;
        }

        const [error, sessionValid, userData] = await validateSession();
        if(!sessionValid) {
            return error;
        }
        if(userData!.githubAccount !== targetOwner) {
            return NO_PERMISSIONS;
        }

        const projectsOwned = await db.select()
            .from(projectTable)
            .where(eq(projectTable.owner, userData!.id));
        if(projectsOwned.length > 14) {
            return NextResponse.json({error: "You may have up to 15 projects per user."}, {status: HttpStatusCode.FORBIDDEN});
        }

        const projectWithName = await db.select()
            .from(projectTable)
            .where(eq(projectTable.name, name));
        if(projectWithName.length > 0) {
            return NextResponse.json({error: "There already exists a project with this name."}, {status: HttpStatusCode.FORBIDDEN});
        }

        const { id } = (await db.insert(projectTable).values({
            name: name,
            targetOwner: targetOwner,
            targetRepo: targetRepo,
            isPublic: isPublic,
            owner: userData!.id,
        }).returning({id: userTable.id}))[0];

        await db.update(userTable).set({
            projects: sql`array_append(${userTable.projects}, ${id})`
        });

        return SUCCESSFUL;
    } catch (e) {
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

        for(const prop of ["name", "desc", "ghOwner", "ghRepo", "isPublic"]) {
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