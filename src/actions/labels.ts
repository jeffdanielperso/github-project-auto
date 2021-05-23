import {GithubActionData} from '../triggers/github';
import {getLabels, GithubProjectAutoInput} from '../triggers/input';
import {GitHub} from '@actions/github/lib/utils';
import {debugLog} from '../debug/debug';

export async function runLabelsAction(
  octokit: InstanceType<typeof GitHub>,
  actionData: GithubActionData
): Promise<void> {
  try {
    // Get last version of Issue
    const issue = await octokit.rest.issues.get({
      owner: actionData.owner,
      repo: actionData.repo,
      issue_number: actionData.issueNumber as number
    });

    // Get Labels to Add & Remove
    const labelsToAdd = getLabels(GithubProjectAutoInput.addLabels);
    const labelsToRemove = getLabels(GithubProjectAutoInput.removeLabels);

    if (labelsToAdd.length === 0 && labelsToRemove.length === 0) return;

    // Generate label list after Add & Remove
    let labels = issue.data.labels.map(label => label.name);
    for (const label of labelsToAdd) {
      if (!labels.includes(labels)) {
        labels.push(label);
      }
    }
    labels = labels.filter(value => !labelsToRemove.includes(value));

    // Update Issue labels
    await octokit.rest.issues.update({
      owner: actionData.owner,
      repo: actionData.repo,
      issue_number: actionData.issueNumber as number,
      labels
    });
  } catch (error) {
    debugLog(`[Error/labels.ts] ${error}`);
    throw error;
  }
}
