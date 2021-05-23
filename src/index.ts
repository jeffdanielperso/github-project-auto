import * as core from '@actions/core';
import * as github from '@actions/github';
import {getLabels, getRepoToken, GithubProjectAutoInput} from './input';
import {getRepositoryName, getOwnerName, getIssueNumber} from './github';

function debugLog(value: string): void {
  console.log(value);
}

function debugLogs(): void {
  debugLog(`Action ${github.context.action}`);
  debugLog(`Actor ${github.context.actor}`);
  debugLog(`ApiUrl ${github.context.apiUrl}`);
  debugLog(`EventName ${github.context.eventName}`);
  debugLog(`Repo ${JSON.stringify(github.context.repo)}`);
  debugLog(`Payload.Action ${github.context.payload.action}`);
  debugLog(`Payload.Comment ${github.context.payload.comment}`);
  debugLog(`Payload.Issue ${github.context.payload.issue}`);
  debugLog(`Payload.PullRequest ${github.context.payload.pull_request}`);
  // debugLog(
  //   `Payload.Sender ${JSON.stringify(github.context.payload.sender)}`
  // );
  // debugLog(
  //   `Payload.Repository ${JSON.stringify(github.context.payload.repository)}`
  // );
  debugLog(
    `Payload.ProjectCard ${JSON.stringify(github.context.payload.project_card)}`
  );
}

async function run(): Promise<void> {
  try {
    // Getting common data
    const repoName = getRepositoryName();
    const ownerName = getOwnerName();
    const issueNumber = getIssueNumber();
    const repoToken = getRepoToken();

    // Uncomment for debug logs
    debugLogs();

    // Getting octokit
    const octokit = github.getOctokit(repoToken);

    // Getting last version of Issue
    const issue = await octokit.rest.issues.get({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber
    });

    // Label management
    const addLabels = getLabels(GithubProjectAutoInput.addLabels);
    const removeLabels = getLabels(GithubProjectAutoInput.removeLabels);
    let labels = issue.data.labels.map(label => label.name);
    for (const label of addLabels) {
      if (!labels.includes(labels)) {
        labels.push(label);
      }
    }
    labels = labels.filter(value => !removeLabels.includes(value));

    // updating issue
    await octokit.rest.issues.update({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber,
      labels
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
