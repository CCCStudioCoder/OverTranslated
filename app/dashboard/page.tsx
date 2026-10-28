'use client'

import {useUser} from "@/app/util/client";
import {Project} from "@/app/util/db";
import {roleIn, targetURL} from "@/app/util/projects";
import {Suspense} from "react";
import {Loading} from "@/app/util/components";

export default function Dashboard() {
    const [user, refreshUserData] = useUser("/dashboard");

    return (
        <main>
            <h1>{user.pseudo}'s projects</h1>
            <button onClick={refreshUserData}>Refresh</button>
            <div>
                {user.projects ? user.projects.map((project, index) => (
                        <Suspense key={index} fallback={<Loading height={200} width={1000} />}>
                            {createProjectDiv(project)}
                        </Suspense>
                    )) :
                    <p>You don't have any projects for now</p>
                }
                <button>Create a project</button>
                <button>Join an already existent project</button>
            </div>
        </main>
    );

    async function createProjectDiv(id: number) {
        const project: Project = await (await fetch(`/api/projects`, {
            method: "POST",
            body: JSON.stringify({ id }),
        })).json();

        return (
            <div>
                <div>
                    <span>{project.name}</span>
                    <span>{project.id}</span>
                </div>
                <p>{targetURL(project)}</p>
                <p>{roleIn(user.id, project)}</p>
                {/* TODO <Image src={poject.isPublic ? "" : ""} width={500} height={500} /> */}
            </div>
        );
    }
}