import * as github from '@actions/github';
import {GitHub} from '@actions/github/lib/utils';

export function getRepositoryName(): string {
  return github.context.repo.repo;
}

export function getOwnerName(): string {
  return github.context.repo.owner;
}

export function getIssueNumber(): number {
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
  } else {
    throw new Error('Could not determinate related issue.');
  }
}

export function getOctokit(repoToken: string): InstanceType<typeof GitHub> {
  return github.getOctokit(repoToken);
}
