'use client'

import {use} from "react";

export default function Project(slug: Promise<{project: string}>) {
    const { project } = use(slug);

    return (
        <div>

        </div>
    );
}