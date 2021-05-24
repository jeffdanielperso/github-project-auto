import {GithubActionData} from '../triggers/github';
import {GitHub} from '@actions/github/lib/utils';
import {debugLog} from '../debug/debug';
import * as core from '@actions/core';
import {Endpoints} from '@octokit/types';

// prettier-ignore
//type TypeOrgResponse = Endpoints["GET /orgs/{org}/projects"]["response"];
// prettier-ignore
type TypeRepoResponse = Endpoints["GET /repos/{owner}/{repo}/projects"]["response"];
// prettier-ignore
type TypeUserResponse = Endpoints["GET /users/{username}/projects"]["response"];

// async function getOrgProjects(
//   octokit: InstanceType<typeof GitHub>,
//   org: string
// ): Promise<TypeOrgResponse> {
//   try {
//     const orgProjects = await octokit.rest.projects.listForOrg({
//       org
//     });
//     return orgProjects;
//   } catch (error) {
//     debugLog(`[Error/project.ts/getOrgProjects] ${error}`);
//     return {data: {}} as TypeOrgResponse;
//   }
// }

async function getRepoProjects(
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string
): Promise<TypeRepoResponse> {
  try {
    const repoProjects = await octokit.rest.projects.listForRepo({
      owner,
      repo
    });
    return repoProjects;
  } catch (error) {
    debugLog(`[Error/project.ts/getRepoProjects] ${error}`);
    return {data: {}} as TypeRepoResponse;
  }
}

async function getUserProjects(
  octokit: InstanceType<typeof GitHub>,
  username: string
): Promise<TypeUserResponse> {
  try {
    const userProjects = await octokit.rest.projects.listForUser({
      username
    });
    return userProjects;
  } catch (error) {
    debugLog(`[Error/project.ts/getUserProjects] ${error}`);
    return {data: {}} as TypeUserResponse;
  }
}

export async function runProjectAction(
  octokit: InstanceType<typeof GitHub>,
  actionData: GithubActionData
): Promise<void> {
  try {
    const projectName = core.getInput('project');
    const columnName = core.getInput('column');

    if (!projectName || !columnName) return;

    // Get projects
    const repoProjects = await getRepoProjects(
      octokit,
      actionData.owner,
      actionData.repo
    );
    const userProjects = await getUserProjects(octokit, actionData.owner);

    ///debugLog(`org ${JSON.stringify(orgProjects, null, '\t')}`);
    debugLog(`repo ${JSON.stringify(repoProjects, null, '\t')}`);
    debugLog(`user ${JSON.stringify(userProjects, null, '\t')}`);
  } catch (error) {
    debugLog(`[Error/project.ts] ${error}`);
  }
}
