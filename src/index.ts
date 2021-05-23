import * as core from '@actions/core';
import * as github from '@actions/github';
import {getLabels, getRepoToken, GithubProjectAutoInput} from './input';
import {getRepositoryName, getOwnerName, getIssueNumber} from './payload';

function debugAction(value: string): void {
  console.log(value);
}

async function run(): Promise<void> {
  try {
    // Getting common data
    const repoName = getRepositoryName();
    const ownerName = getOwnerName();
    const issueNumber = getIssueNumber();
    const repoToken = getRepoToken();

    debugAction(`Action ${github.context.action}`);
    debugAction(`Actor ${github.context.actor}`);
    debugAction(`ApiUrl ${github.context.apiUrl}`);
    debugAction(`EventName ${github.context.eventName}`);
    debugAction(`Repo ${JSON.stringify(github.context.repo)}`);
    debugAction(`Payload.Action ${github.context.payload.action}`);
    debugAction(`Payload.Comment ${github.context.payload.comment}`);
    debugAction(`Payload.Issue ${github.context.payload.issue}`);
    debugAction(`Payload.PullRequest ${github.context.payload.pull_request}`);
    debugAction(
      `Payload.Sender ${JSON.stringify(github.context.payload.sender)}`
    );
    debugAction(
      `Payload.Repository ${JSON.stringify(github.context.payload.repository)}`
    );
    debugAction(
      `Payload.ProjectCard ${JSON.stringify(
        github.context.payload.project_card
      )}`
    );
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
