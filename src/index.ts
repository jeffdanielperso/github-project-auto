import * as core from '@actions/core';
import * as github from '@actions/github';

enum InputId {
  repoToken = 'repo-token',
  addLabels = 'add-labels',
  removeLabels = 'remove-labels'
}

function isEmpty(value: any): boolean {
  return (value == null || value.length === 0);
}

function getRepositoryName(): string {
  const payload = github.context.payload;

  if (payload.repository) {
    return payload.repository.name;
  }
  
  throw "Could not determinate Repository";
}

function getOwner(): string {
  const payload = github.context.payload;
  
  if (payload.repository) {
    return payload.repository.owner.login;
  }

  throw "Could not determinate Repository";
}

function getIssue(): number {
  const payload = github.context.payload;

  // Action coming from issues
  if (payload.issue) {
    return payload.issue.number;
  }
  else if (payload.pull_request) {
    return payload.pull_request.number;
  }
  else if (payload.project_card !== undefined &&
    payload.project_card.content_url) {
      return payload.project_card.content_url.split("/").pop();
  }
  else throw "Could not determinate related issue."
}

function getRepoToken(): string {
  return core.getInput(InputId.repoToken);
}

function getLabels(type: string): Array<string> {
  var labels = core
    .getInput(type)
    .split(',')
    .map(value => value.trim());

  return labels.filter(value => ![""].includes(value));
}

async function run(): Promise<void> {
  try {
    // Getting common data
    const repoName = getRepositoryName();
    const owner = getOwner();
    const issue = getIssue();
    const repoToken = getRepoToken();
    const octokit = github.getOctokit(repoToken);

    // Label management
    const addLabels = getLabels(InputId.addLabels);
    const removeLabels = getLabels(InputId.removeLabels);

    // Getting last version of Issue
  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
