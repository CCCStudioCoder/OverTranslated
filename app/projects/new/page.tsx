'use client'

import {Suspense, useEffect, useRef, useState} from "react";
import {Loading} from "@/app/util/components";
import {useRouter} from "next/navigation";

export default function NewProject() {
    const nameRef = useRef<HTMLInputElement>(null);
    const privateRef = useRef<HTMLInputElement>(null);

    const [selectedRepo, setSelectedRepo] = useState("");
    const [statusInfo, setStatusInfo] = useState("");

    const router = useRouter();

    return (
        <div>
            <h1>New Project</h1>
            <label htmlFor="name">Project name (by default the name of the selected repository</label>
            <input name="name" type="text" ref={nameRef} />
            <p>Select repository</p>
            <Suspense fallback={<Loading height={500} width={500} />}>
                <RepositoryDropdown selectedRepo={selectedRepo} setSelectedRepo={setSelectedRepo} />
            </Suspense>
            <label htmlFor="name">Make project private</label>
            <input name="name" type="checkbox" ref={privateRef} />
            <p>{statusInfo}</p>
            <button onClick={submit}>Create project</button>
        </div>
    );

    async function submit() {
        const parts = selectedRepo.split("/")
        const name = nameRef.current!.value || parts[1];
        const isPrivate = privateRef.current!.checked;

        const { error } = await fetch("/api/projects", {
            method: "PUT",
            body: JSON.stringify({
                name,
                targetOwner: parts[0],
                targetRepo: parts[1],
                isPublic: !isPrivate,
            }),
        }).then(res => res.json());

        if(error) {
            setStatusInfo(error);
        } else {
            router.replace("/projects/" + name);
            router.refresh();
        }
    }
}

function RepositoryDropdown({selectedRepo, setSelectedRepo}: {selectedRepo: string, setSelectedRepo: (repo: string) => void}) {
    const [repos, setRepos] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/github/get_repos")
            .then(res => res.json())
            .then(data => setRepos(data.repos));
    }, [setRepos]);

    return (
        <div>
            {repos.map((repo, i) => (
                <div key={i} className={`${repo == selectedRepo ? "selected" : ""}`} onClick={() => setSelectedRepo(repo)}>
                    {repo.split("/")[1]}
                </div>
            ))}
        </div>
    );
}