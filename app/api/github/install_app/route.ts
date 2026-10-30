import {NextRequest, NextResponse} from "next/server";
import {validateSession} from "@/app/util/session";
import HttpStatusCode from "@/app/util/status-code";
import github from "@/app/util/github";
import {db} from "@/app/db";
import {userTable} from "@/app/db/schema";
import {eq} from "drizzle-orm";

const RES = (status: number) =>
    NextResponse.redirect("/dashboard", {status: status});

export async function GET(req: NextRequest) {
    try {
        const installationId = Number(req.nextUrl.searchParams.get('installation_id')!);

        const [_, sessionValid, userData] = await validateSession();
        if(!sessionValid) {
            return RES(HttpStatusCode.UNAUTHORIZED);
        }

        const octokit = await github.getInstallationOctokit(installationId);
        const user = await octokit.rest.users.getAuthenticated()
            .then(request => request.data);
        const trustedInstallationId = await octokit.rest.apps.getUserInstallation({ username: user.login })
            .then(request => request.data.id);

        if(trustedInstallationId !== installationId) {
            return RES(HttpStatusCode.FORBIDDEN);
        }

        await db.update(userTable)
            .set({
                githubAppId: installationId,
                githubAccount: user.login,
            }).where(eq(userTable.id, userData!.id));

        return RES(HttpStatusCode.OK);
    } catch (_) {
        return RES(HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
}