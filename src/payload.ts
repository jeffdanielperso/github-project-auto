import * as github from '@actions/github';

export function getRepositoryName(): string {
  const payload = github.context.payload;

  if (payload.repository) {
    return payload.repository.name;
  }

  throw new Error('Could not determinate Repository');
}

export function getOwnerName(): string {
  const payload = github.context.payload;

  if (payload.repository) {
    return payload.repository.owner.login;
  }

  throw new Error('Could not determinate Repository');
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
