import * as github from '@actions/github';
import {Octokit} from '../octokit/types';

export type GithubActionData = {
  repo: string;
  owner: string;
  issueNumber: number | null;
};

export function getRepositoryName(): string {
  return github.context.repo.repo;
}

export function getOwnerName(): string {
  return github.context.repo.owner;
}

export function getIssueNumber(): number | null {
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
  }

  return null;
}

export function getGithubActionData(): GithubActionData {
  return {
    repo: getRepositoryName(),
    owner: getOwnerName(),
    issueNumber: getIssueNumber()
  } as GithubActionData;
}

export function getOctokit(repoToken: string): Octokit {
  return github.getOctokit(repoToken);
}
