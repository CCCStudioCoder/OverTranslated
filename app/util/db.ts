import {NextResponse} from "next/server";
import {projectTable, userTable} from "@/app/db/schema";

export function dbError(e: any) {
    return NextResponse.json({error: "Database or internal error: " + e}, {status: 500});
}

export type User = typeof userTable.$inferSelect;
export type Project = typeof projectTable.$inferSelect;