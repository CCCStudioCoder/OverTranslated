import {validateSession} from "@/app/util/session";

export async function POST() {
    return await validateSession();
}