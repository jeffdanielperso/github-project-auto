import * as core from '@actions/core';

export enum ActionInput {
  repoToken = 'repo-token',
  addLabels = 'add-labels',
  removeLabels = 'remove-labels',
  repository = 'repository',
  project = 'project',
  column = 'column'
}

export type ActionInputs = {
  token: string;
  labelsToAdd: string[];
  labelsToRemove: string[];
  repository: string;
  project: string;
  column: string;
};

export function extractLabels(type: string): string[] {
  const labels = core
    .getInput(type)
    .split(',')
    .map(value => value.trim());

  return labels.filter(value => ![''].includes(value));
}

export function getInputs(): ActionInputs {
  return {
    token: core.getInput(ActionInput.repoToken),
    labelsToAdd: extractLabels(ActionInput.addLabels),
    labelsToRemove: extractLabels(ActionInput.removeLabels),
    repository: core.getInput(ActionInput.repository),
    project: core.getInput(ActionInput.project),
    column: core.getInput(ActionInput.column)
  } as ActionInputs;
}
