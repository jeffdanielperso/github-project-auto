import * as github from '@actions/github';
import * as core from '@actions/core';

export function debugLog(value: string): void {
  console.log(value);
  core.debug(value);
}

export function debugLogs(): void {
  debugLog(`Action ${github.context.action}`);
  debugLog(`Actor ${github.context.actor}`);
  debugLog(`ApiUrl ${github.context.apiUrl}`);
  debugLog(`EventName ${github.context.eventName}`);
  debugLog(`Repo ${JSON.stringify(github.context.repo, null, '\t')}`);
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
    `Payload.ProjectCard ${JSON.stringify(
      github.context.payload.project_card,
      null,
      '\t'
    )}`
  );
}
