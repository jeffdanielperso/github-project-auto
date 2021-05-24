import {GithubActionData} from '../triggers/github';
import {debugLog} from '../debug/debug';
import * as core from '@actions/core';
import {
  Octokit,
  Columns,
  Project,
  Projects,
  OrgProjects,
  RepoProjects,
  UserProjects,
  Issue,
  Card
} from '../octokit/types';

async function getOrgProjects(
  octokit: Octokit,
  org: string
): Promise<OrgProjects> {
  try {
    const orgProjects = await octokit.rest.projects.listForOrg({
      org
    });
    return orgProjects.data;
  } catch (error) {
    debugLog(`[Error/project.ts/getOrgProjects] ${error}`);
    return [] as OrgProjects;
  }
}

async function getRepoProjects(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<RepoProjects> {
  try {
    const repoProjects = await octokit.rest.projects.listForRepo({
      owner,
      repo
    });
    return repoProjects.data;
  } catch (error) {
    debugLog(`[Error/project.ts/getRepoProjects] ${error}`);
    return [] as RepoProjects;
  }
}

async function getUserProjects(
  octokit: Octokit,
  username: string
): Promise<UserProjects> {
  try {
    const userProjects = await octokit.rest.projects.listForUser({
      username
    });
    return userProjects.data;
  } catch (error) {
    debugLog(`[Error/project.ts/getUserProjects] ${error}`);
    return [] as UserProjects;
  }
}

async function getProjects(
  octokit: Octokit,
  actionData: GithubActionData
): Promise<Projects> {
  const projects = [] as Projects;

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

async function findMatchingCard(
  octokit: Octokit,
  columns: Columns,
  issue: Issue
): Promise<Card | null> {
  for (const column of columns) {
    const colCards = await octokit.rest.projects.listCards({
      column_id: column.id
    });

    const matchingCard = colCards.data.find(
      card => card.content_url === issue.url
    );
    if (matchingCard) {
      debugLog(`MatchingCard ${JSON.stringify(matchingCard, null, '\t')}`);
      return matchingCard;
    }
  }
  return null;
}

async function tryAndRunOnProject(
  octokit: Octokit,
  project: Project,
  columnName: string,
  issue: Issue
): Promise<void> {
  const columns = await octokit.rest.projects.listColumns({
    project_id: project.id
  });

  debugLog(`Issue ${JSON.stringify(issue, null, '\t')}`);

  const matchingColumn = columns.data.find(
    column => column.name === columnName
  );

  if (matchingColumn) {
    debugLog(
      `Found matching project '${project.name}' [${project.id}] & column '${matchingColumn.name}' [${matchingColumn.id}]\n${project.html_url}`
    );

    const matchingCard = await findMatchingCard(octokit, columns.data, issue);
    if (matchingCard) {
      debugLog(`Card existing in project`);
    } else {
      debugLog(`Card not existing`);
    }
  }
}

export async function runProjectAction(
  octokit: Octokit,
  actionData: GithubActionData,
  issue: Issue
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
      tryAndRunOnProject(octokit, project, columnName, issue);
    }
  } catch (error) {
    debugLog(`[Error/project.ts] ${error}`);
  }
}
