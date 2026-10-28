import {Project} from "@/app/util/db";

export function targetURL(project: Project) {
    return `https://github.com/${project.targetOwner}/${project.targetRepo}`;
}

export enum Role {
    OWNER = "Owner",
    ADMIN = "Administrator",
    CONTRIBUTOR = "Contributor",
    NONE = "None",
}

export function roleIn(userId: number, project: Project): Role {
    if (project.owner === userId) return Role.OWNER;
    if (project.admins && project.admins.includes(userId)) return Role.ADMIN;
    if (project.contributors && project.contributors.includes(userId)) return Role.CONTRIBUTOR;
    return Role.NONE;
}

export function hasRights(userId: number, project: Project): boolean {
    const role = roleIn(userId, project);
    return [Role.OWNER, Role.ADMIN].includes(role);
}