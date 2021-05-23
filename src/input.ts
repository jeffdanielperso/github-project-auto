import * as core from '@actions/core';

export enum GithubProjectAutoInput {
  repoToken = 'repo-token',
  addLabels = 'add-labels',
  removeLabels = 'remove-labels'
}

export function getRepoToken(): string {
  return core.getInput(GithubProjectAutoInput.repoToken);
}

export function getLabels(type: string): string[] {
  const labels = core
    .getInput(type)
    .split(',')
    .map(value => value.trim());

  return labels.filter(value => ![''].includes(value));
}
