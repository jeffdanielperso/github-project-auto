import * as core from '@actions/core';

export enum ActionInput {
  githubToken = 'github-token',
  labels_add = 'labels-add',
  labels_remove = 'labels-remove',
  project_scope = 'project-scope',
  project_name = 'project-name',
  project_column = 'project-column'
}

export type ActionInputs = {
  token: string;
  labels_add: string[];
  labels_remove: string[];
  project_scope: Scope;
  project_name: string;
  project_column: string;
};

export enum Scope {
  organization,
  repository,
  user,
  all
}

function extractLabels(inputKey: string): string[] {
  const labels = core
    .getInput(inputKey)
    .split(',')
    .map(value => value.trim());

  return labels.filter(value => ![''].includes(value));
}

function extractScope(inputKey: string): Scope {
  const input = core.getInput(inputKey);
  if (input) {
    try {
      return Scope[input.toLocaleLowerCase() as keyof typeof Scope];
    } catch {
      // continue regardless of error
    }
  }

  return Scope.all;
}

export function getInputs(): ActionInputs {
  return {
    token: core.getInput(ActionInput.githubToken),
    labels_add: extractLabels(ActionInput.labels_add),
    labels_remove: extractLabels(ActionInput.labels_remove),
    project_scope: extractScope(ActionInput.project_scope),
    project_name: core.getInput(ActionInput.project_name),
    project_column: core.getInput(ActionInput.project_column)
  } as ActionInputs;
}
