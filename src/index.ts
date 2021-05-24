import * as core from '@actions/core';
import {getRepoToken} from './triggers/input';
import {getOctokit, getGithubActionData} from './triggers/github';
import {runLabelsAction} from './actions/labels';
import {runProjectAction} from './actions/project';
import {getIssue} from './actions/issues';
//import {debugLogs} from './debug/debug';

async function run(): Promise<void> {
  try {
    // Getting common data
    const actionData = getGithubActionData();
    const repoToken = getRepoToken();

    if (!actionData.issueNumber) {
      throw new Error('Error: Could not determinate Issue.');
    }

    // Uncomment for debug logs
    //debugLogs();

    // Getting octokit
    const octokit = getOctokit(repoToken);

    // Get issue
    const issue = await getIssue(octokit, actionData);

    // Run actions
    runLabelsAction(octokit, actionData, issue);
    runProjectAction(octokit, actionData, issue);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
