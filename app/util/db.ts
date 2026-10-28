import {NextResponse} from "next/server";
import {projectTable, userTable} from "@/app/db/schema";
import HttpStatusCode from "@/app/util/status-code";

export function dbError(e: any) {
    return NextResponse.json({error: "Database or internal error: " + e}, {status: HttpStatusCode.INTERNAL_SERVER_ERROR});
}

export type User = typeof userTable.$inferSelect;
export type Project = typeof projectTable.$inferSelect;

export const SUCCESSFUL = NextResponse.json({}, {status: HttpStatusCode.OK});