import {boolean, integer, serial, snakeCase, varchar} from "drizzle-orm/pg-core";

export const userTable = snakeCase.table("users", {
    id: serial().primaryKey(),
    pseudo: varchar().notNull().unique(),
    password: varchar().notNull(),
    ip: varchar().notNull().unique(),
    githubApiKey: varchar(),
    sessionKey: varchar().notNull().unique(),
    sessionKeyCreation: integer().notNull(),
    projects: integer().array().notNull().default([]),
});

export const projectTable = snakeCase.table("projects", {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    description: varchar(),
    targetOwner: varchar().notNull(),
    targetRepo: varchar().notNull(),
    checkedTarget: boolean(),
    owner: integer().notNull(),
    admins: integer().array().notNull().default([]),
    contributors: integer().array().notNull().default([]),
    isPublic: boolean().notNull(),
});

export const inviteTokenTable = snakeCase.table("inviteTokens", {
    id: serial().primaryKey(),
    name: varchar().notNull().unique(),
    linksTo: integer().notNull(),
    admin: boolean().notNull(),
    expireDate: integer().notNull(),
    leftUses: integer().notNull()
})