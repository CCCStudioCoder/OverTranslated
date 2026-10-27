import {boolean, integer, serial, snakeCase, varchar} from "drizzle-orm/pg-core";

export const userTable = snakeCase.table("users", {
    id: serial().primaryKey(),
    pseudo: varchar().notNull(),
    password: varchar().notNull(),
    ip: varchar().notNull(),
    githubApiKey: varchar(),
    sessionKey: varchar(),
    projects: integer().array(),
});

export const projectTable = snakeCase.table("projects", {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    description: varchar(),
    targetOwner: varchar().notNull(),
    targetRepo: varchar().notNull(),
    checkedTarget: boolean(),
    owner: integer().notNull(),
});