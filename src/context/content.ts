import {Issue} from '../github/types';
import * as github from '@actions/github';
import {ActionContext} from './context';
import {IssuesRequests} from '../github/issues_requests';

export enum ContentType {
  IssueContent = 'Issue',
  PullRequestContent = 'PullRequest',
  NotLoaded = 'NotLoaded',
  NoContent = 'NoContent'
}

export class Content {
  id: number;
  issue?: Issue;
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
      this.id = +payload.project_card.content_url.split('/').pop();
      this.type = ContentType.NotLoaded;
    } else {
      this.id = -1;
      this.type = ContentType.NoContent;
    }
  }

  async load(context: ActionContext): Promise<void> {
    if (this.type !== ContentType.NoContent) {
      this.issue = await IssuesRequests.getIssue(
        context.octokit,
        context.owner,
        context.repository,
        this.id
      );

      if (this.type === ContentType.NotLoaded) {
        this.type = this.issue.pull_request
          ? ContentType.PullRequestContent
          : ContentType.IssueContent;
      }
    }
  }
}
