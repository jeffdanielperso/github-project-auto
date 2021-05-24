import {Issue, Octokit} from '../octokit/types';
import {GithubActionData} from '../triggers/github';

export async function getIssue(
  octokit: Octokit,
  actionData: GithubActionData
): Promise<Issue> {
  const issue = await octokit.rest.issues.get({
    owner: actionData.owner,
    repo: actionData.repo,
    issue_number: actionData.issueNumber as number
  });
  return issue.data;
}
