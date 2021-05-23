import {Endpoints} from '@octokit/types';
import {getLabels, GithubProjectAutoInput} from '../triggers/input';

export type LabelActionSetup = {
  hasChanges: boolean;
  labels: string[] | null;
};

export function setupLabelAction(
  // prettier-ignore
  issue: Endpoints["GET /repos/{owner}/{repo}/issues/{issue_number}"]["response"]
): LabelActionSetup {
  const labelsToAdd = getLabels(GithubProjectAutoInput.addLabels);
  const labelsToRemove = getLabels(GithubProjectAutoInput.removeLabels);

  if (labelsToRemove.length !== 0 || labelsToAdd.length !== 0) {
    let labels = issue.data.labels.map(label => label.name);
    for (const label of labelsToAdd) {
      if (!labels.includes(labels)) {
        labels.push(label);
      }
    }
    labels = labels.filter(value => !labelsToRemove.includes(value));

    return {
      hasChanges: true,
      labels
    } as LabelActionSetup;
  } else {
    return {
      hasChanges: false
    } as LabelActionSetup;
  }
}
