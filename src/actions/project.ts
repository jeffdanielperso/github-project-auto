import {GithubActionData} from '../triggers/github';
import {GitHub} from '@actions/github/lib/utils';
import {debugLog} from '../debug/debug';

export async function runProjectAction(
  octokit: InstanceType<typeof GitHub>,
  actionData: GithubActionData
): Promise<void> {
  try {
    // Get projects
    const orgProjects = await octokit.rest.projects.listForOrg({
      org: actionData.owner
    });
    const repoProjects = await octokit.rest.projects.listForRepo({
      owner: actionData.owner,
      repo: actionData.repo
    });
    const userProjects = await octokit.rest.projects.listForUser({
      username: actionData.owner
    });

    debugLog(`org ${JSON.stringify(orgProjects)}`);
    debugLog(`org ${JSON.stringify(repoProjects)}`);
    debugLog(`org ${JSON.stringify(userProjects)}`);
  } catch (error) {
    debugLog(`[Error/project.ts] ${error}`);
    throw error;
  }
}