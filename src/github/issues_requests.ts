import {ActionContext} from '../context/context';
import {Issue, Octokit} from './types';

export class IssuesRequests {
  static async getIssue(
    octokit: Octokit,
    owner: string,
    repo: string,
    issue_number: number
  ): Promise<Issue> {
    const response = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number
    });
    return response.data;
  }

  static async getIssueOfContext(context: ActionContext): Promise<Issue> {
    return await this.getIssue(
      context.octokit,
      context.owner,
      context.repository,
      context.content.number
    );
  }

  static async updateLabels(
    context: ActionContext,
    labels: string[]
  ): Promise<void> {
    await context.octokit.rest.issues.update({
      owner: context.owner,
      repo: context.repository,
      issue_number: context.content.number,
      labels
    });
  }
}
