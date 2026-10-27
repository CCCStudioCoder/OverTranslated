import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("session")?.value;

    if (pathname !== "/" && !session) {
        return NextResponse.redirect(
            new URL("/auth/login", request.url)
        );
    }

    return NextResponse.next();
}

const noLogin = [
    "auth",
    "_next",
    "favicon.ico"
];

export const config = {
    matcher: [`/((?!${noLogin.join("|")}))*).*)`],
};
