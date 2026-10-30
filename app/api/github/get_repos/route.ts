import {dbError} from "@/app/util/db";
import {validateSession} from "@/app/util/session";
import {NextResponse} from "next/server";
import HttpStatusCode from "@/app/util/status-code";
import github from "@/app/util/github";

export async function GET() {
    try {
        const [error, sessionValid, userData] = await validateSession();
        if(!sessionValid) {
            return error;
        }

        if(!userData!.githubAppId) {
            return NextResponse.json({error: "Please connect your account to GitHub to create a project.", redirect: true},
                {status: HttpStatusCode.UNAUTHORIZED});
        }

        const octokit = await github.getInstallationOctokit(Number(userData!.githubAppId));
        const repos = await octokit.rest.repos.listForAuthenticatedUser().then(req => req.data);

        return NextResponse.json({repos: repos.map(repo => repo.full_name)}, {status: HttpStatusCode.OK})
    } catch (e) {
        return dbError(e);
    }
}