import {Octokit} from '../github/types';
import {ActionInputs, getInputs} from './inputs';
import * as github from '@actions/github';
import {Content, ContentType} from './content';

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
      await this.content.load(this);
    }
  }
}
