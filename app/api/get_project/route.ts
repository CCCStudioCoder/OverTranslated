import {NextRequest, NextResponse} from "next/server";
import {dbError} from "@/app/util/db";
import {db} from "@/app/db";
import {projectTable} from "@/app/db/schema";
import {eq} from "drizzle-orm";
import {validateSession} from "@/app/util/session";

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        if(typeof id !== "number") {
            return NextResponse.json({error: "Invalid project id"}, {status: 400});
        }

        const projectSearch = await db.select()
            .from(projectTable)
            .where(eq(projectTable.id, id));

        if(projectSearch.length == 0) {
            return NextResponse.json({error: "No project found."}, {status: 404});
        }

        const [sessionError, sessionValid] = await validateSession();

        return sessionValid ? NextResponse.json({...projectSearch[0]}, {status: 200}) : sessionError;
    } catch(e) {
        return dbError(e);
    }
}