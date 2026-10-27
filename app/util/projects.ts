import {Project} from "@/app/util/db";

export function targetURL(project: Project) {
    return `https://github.com/${project.targetOwner}/${project.targetRepo}`;
}

export enum Role {
    OWNER = "Owner",
    SUPERADMIN = "Super Admin",
    ADMIN = "Administrator",
    CONTRIBUTOR = "Contributor",
    NONE = "None",
}

export function roleIn(userId: number, project: Project): Role {
    if (project.owner === userId) return Role.OWNER;
    if (project.superAdmins && project.superAdmins.includes(userId)) return Role.SUPERADMIN;
    if (project.admins && project.admins.includes(userId)) return Role.ADMIN;
    if (project.contributors && project.contributors.includes(userId)) return Role.CONTRIBUTOR;
    return Role.NONE;
}