import * as core from '@actions/core';
import {
  getLabels,
  getRepoToken,
  GithubProjectAutoInput
} from './triggers/input';
import {
  getRepositoryName,
  getOwnerName,
  getIssueNumber,
  getOctokit
} from './triggers/github';
import {setupLabelAction} from './actions/labels';
//import { debugLogs } from './debug/debug';

async function run(): Promise<void> {
  try {
    // Getting common data
    const repoName = getRepositoryName();
    const ownerName = getOwnerName();
    const issueNumber = getIssueNumber();
    const repoToken = getRepoToken();

    // Uncomment for debug logs
    //debugLogs();

    // Getting octokit
    const octokit = getOctokit(repoToken);

    // Getting last version of Issue
    const issue = await octokit.rest.issues.get({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber
    });

    // Get Label action setup
    const labelActionSetup = setupLabelAction(issue);

    // updating issue
    if (labelActionSetup.hasChanges) {
      await octokit.rest.issues.update({
        owner: ownerName,
        repo: repoName,
        issue_number: issueNumber,
        labels: labelActionSetup.labels
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
