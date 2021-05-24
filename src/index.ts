import * as core from '@actions/core';
import {getRepoToken} from './triggers/input';
import {getOctokit, getGithubActionData} from './triggers/github';
import {runLabelsAction} from './actions/labels';
import {runProjectAction} from './actions/project';
import {debugLog} from './debug/debug';
//import { debugLogs } from './debug/debug';

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
    debugLog(`repo-token ${repoToken}`);
    const octokit = getOctokit(repoToken);

    // Run actions
    runLabelsAction(octokit, actionData);
    runProjectAction(octokit, actionData);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
