import {GithubActionData} from '../triggers/github';
import {GitHub} from '@actions/github/lib/utils';
import {debugLog} from '../debug/debug';
import * as core from '@actions/core';
import {Endpoints} from '@octokit/types';

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

async function getProjects(
  octokit: InstanceType<typeof GitHub>,
  actionData: GithubActionData
): Promise<TypeProjectList> {
  const projects = [] as TypeProjectList;

  const orgProjects = await getOrgProjects(octokit, actionData.owner);
  for (const project of orgProjects) {
    projects.push(project);
  }

  const repoProjects = await getRepoProjects(
    octokit,
    actionData.owner,
    actionData.repo
  );
  for (const project of repoProjects) {
    projects.push(project);
  }

  const userProjects = await getUserProjects(octokit, actionData.owner);
  for (const project of userProjects) {
    projects.push(project);
  }

  // debugLog(`org: ${JSON.stringify(orgProjects, null, '\t')}`);
  // debugLog(`repo: ${JSON.stringify(repoProjects, null, '\t')}`);
  // debugLog(`user: ${JSON.stringify(userProjects, null, '\t')}`);
  // debugLog(`global: ${JSON.stringify(projects, null, '\t')}`);

  return projects;
}

async function tryAndRunOnProject(
  octokit: InstanceType<typeof GitHub>,
  project: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  columnName: string,
  actionData: GithubActionData // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<void> {
  const columns = await octokit.rest.projects.listColumns({
    project_id: project.id
  });

  const matchingColumn = columns.data.find(
    column => column.name === columnName
  );

  if (matchingColumn) {
    debugLog(
      `Found matching project '${project.name}' [${project.id}] & column '${matchingColumn.name}' [${matchingColumn.id}]\n${project.url}`
    );
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
    const projects = await getProjects(octokit, actionData);

    // Get matching projects
    const matchingProjects = projects.filter(p => p.name === projectName);

    // Try & Run action on matching projects
    for (const project of matchingProjects) {
      tryAndRunOnProject(octokit, project, columnName, actionData);
    }
  } catch (error) {
    debugLog(`[Error/project.ts] ${error}`);
  }
}
