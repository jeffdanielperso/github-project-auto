import {Issue, PullRequest} from '../github/types';
import * as github from '@actions/github';
import {ActionContext} from './context';
import {IssuesRequests} from '../github/issues_requests';
import {Logger} from '../logs/logger';

export enum ContentType {
  IssueContent = 'Issue',
  PullRequestContent = 'PullRequest',
  Unknown = 'None'
}

export class Content {
  id: number;
  issue?: Issue;
  pullRequest?: PullRequest;
  type: ContentType;

  constructor() {
    const payload = github.context.payload;

    if (payload.issue) {
      this.id = payload.issue.number;
      this.type = ContentType.IssueContent;
    } else if (payload.pull_request) {
      this.id = payload.pull_request.number;
      this.type = ContentType.PullRequestContent;
    } else if (
      payload.project_card !== undefined &&
      payload.project_card.content_url
    ) {
      const values = payload.project_card.content_url.split('/');
      this.id = values.pop();
      const contentType = values.pop();
      this.type =
        contentType === 'issues'
          ? ContentType.IssueContent
          : ContentType.PullRequestContent;
      Logger.debugOject('values', values);
      Logger.debugData('contentType', contentType);
      Logger.debugOject('ProjectCard', payload.project_card);
    } else {
      this.id = -1;
      this.type = ContentType.Unknown;
    }
  }

  async load(context: ActionContext): Promise<void> {
    if (this.type === ContentType.IssueContent) {
      this.issue = await IssuesRequests.getIssue(
        context.octokit,
        context.owner,
        context.repository,
        this.id
      );
    } else if (this.type === ContentType.PullRequestContent) {
      // TODO
    }

    return;
  }
}
