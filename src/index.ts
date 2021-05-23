import * as core from '@actions/core';

function isEmpty(value: any): boolean {
  return (value == null || value.length === 0);
}

async function run(): Promise<void> {
  try {
    const addLabels = core.getInput('add-labels');
    const removeLabels = core.getInput('remove-labels');
    const repoToken = core.getInput('repo-token');

    const hasAdd = !isEmpty(addLabels);
    const hasRemove = !isEmpty(removeLabels);
    const hasToken = !isEmpty(repoToken);

    core.setOutput('test-output', `Test A ${hasAdd} R ${hasRemove} T ${hasToken}`);
  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
