import {Octokit} from '../github/types';
import {ActionInputs, getInputs} from './inputs';
import * as github from '@actions/github';
import {Content, ContentType} from './content';
import {Logger} from '../logs/logger';

export class ActionContext {
  inputs: ActionInputs;
  owner: string;
  repository: string;
  octokit: Octokit;
  content: Content;

  constructor() {
    this.inputs = getInputs();
    this.owner = github.context.repo.owner;
    this.repository = github.context.repo.repo;
    this.octokit = github.getOctokit(this.inputs.token);
    this.content = new Content();
  }

  async loadContent(): Promise<void> {
    if (this.content.type !== ContentType.NoContent) {
      this.content.load(this);
      Logger.debugOject('Content', this.content);
    }
  }
}
