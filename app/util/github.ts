import {App} from "octokit";

const github = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_KEY!,
});

export default github;
