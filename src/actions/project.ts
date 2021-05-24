import {GithubActionData} from '../triggers/github';
import {GitHub} from '@actions/github/lib/utils';
import {debugLog} from '../debug/debug';
import * as core from '@actions/core';
import {Endpoints} from '@octokit/types';
import { InvalidatedProjectKind } from 'typescript';

// prettier-ignore
type TypeOrgResponse = Endpoints["GET /orgs/{org}/projects"]["response"]["data"];
// prettier-ignore
type TypeRepoResponse = Endpoints["GET /repos/{owner}/{repo}/projects"]["response"]["data"];
// prettier-ignore
type TypeUserResponse = Endpoints["GET /users/{username}/projects"]["response"]["data"];
type TypeProjectList = TypeRepoResponse;

async function getOrgProjects(
  octokit: InstanceType<typeof GitHub>,
  org: string
): Promise<TypeOrgResponse> {
  try {
    const orgProjects = await octokit.rest.projects.listForOrg({
      org
    });
    return orgProjects.data;
  } catch (error) {
    debugLog(`[Error/project.ts/getOrgProjects] ${error}`);
    return [] as TypeOrgResponse;
  }
}

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
    return repoProjects.data;
  } catch (error) {
    debugLog(`[Error/project.ts/getRepoProjects] ${error}`);
    return [] as TypeRepoResponse;
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
    return userProjects.data;
  } catch (error) {
    debugLog(`[Error/project.ts/getUserProjects] ${error}`);
    return [] as TypeUserResponse;
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
    let projects = [] as TypeProjectList;
    const orgProjects = await getOrgProjects(octokit, actionData.owner);
    orgProjects.forEach(project => projects.push(project));

    const repoProjects = await getRepoProjects(
      octokit,
      actionData.owner,
      actionData.repo
    );
    repoProjects.forEach(project => projects.push(project));
    
    const userProjects = await getUserProjects(octokit, actionData.owner);
    userProjects.forEach(project => projects.push(project));

    // debugLog(`org: ${JSON.stringify(orgProjects, null, '\t')}`);
    // debugLog(`repo: ${JSON.stringify(repoProjects, null, '\t')}`);
    // debugLog(`user: ${JSON.stringify(userProjects, null, '\t')}`);
    debugLog(`global: ${JSON.stringify(projects, null, '\t')}`);
  } catch (error) {
    debugLog(`[Error/project.ts] ${error}`);
  }
}
