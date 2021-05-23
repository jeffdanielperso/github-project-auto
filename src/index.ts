import * as core from '@actions/core';
import * as github from '@actions/github';
import {GithubProjectAutoInput} from './input';

function getRepositoryName(): string {
  const payload = github.context.payload;

  if (payload.repository) {
    return payload.repository.name;
  }

  throw new Error('Could not determinate Repository');
}

function getOwner(): string {
  const payload = github.context.payload;

  if (payload.repository) {
    return payload.repository.owner.login;
  }

  throw new Error('Could not determinate Repository');
}

function getIssueNumber(): number {
  const payload = github.context.payload;

  // Action coming from issues
  if (payload.issue) {
    return payload.issue.number;
  } else if (payload.pull_request) {
    return payload.pull_request.number;
  } else if (
    payload.project_card !== undefined &&
    payload.project_card.content_url
  ) {
    return payload.project_card.content_url.split('/').pop();
  } else throw new Error('Could not determinate related issue.');
}

function getRepoToken(): string {
  return core.getInput(GithubProjectAutoInput.repoToken);
}

function getLabels(type: string): string[] {
  const labels = core
    .getInput(type)
    .split(',')
    .map(value => value.trim());

  return labels.filter(value => ![''].includes(value));
}

async function run(): Promise<string> {
  try {
    // Getting common data
    const repoName = getRepositoryName();
    const ownerName = getOwner();
    const issueNumber = getIssueNumber();
    const repoToken = getRepoToken();
    const octokit = github.getOctokit(repoToken);

    // Label management
    const addLabels = getLabels(GithubProjectAutoInput.addLabels);
    const removeLabels = getLabels(GithubProjectAutoInput.removeLabels);

    // Getting last version of Issue
    const issue = await octokit.rest.issues.get({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber
    });

    let labels = issue.data.labels.map(label => label.name);
    for (const label of addLabels) {
      if (!labels.includes(labels)) {
        labels.push(label);
      }
    }
    labels = labels.filter(value => !removeLabels.includes(value));

    await octokit.rest.issues.update({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber,
      labels
    });

    return `Updated labels in ${issueNumber}. Added: ${addLabels}. Removed: ${removeLabels}.`;
  } catch (error) {
    core.setFailed(error.message);
    return `ERROR: ${error.message}`;
  }
}

run();
