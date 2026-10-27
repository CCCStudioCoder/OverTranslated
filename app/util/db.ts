import {randomBytes} from "node:crypto";
import {NextResponse} from "next/server";
import {userTable} from "@/app/db/schema";

export function createSession() {
    return randomBytes(32).toString("hex");
}

export function dbError(e: any) {
    return NextResponse.json({error: "Database or internal error: " + e}, {status: 500});
}

export type User = typeof userTable.$inferSelect;