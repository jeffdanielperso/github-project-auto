import * as core from '@actions/core';
import {ActionContext} from './context/context';
import {ContentType} from './context/content';
import {Orchestrator} from './actions/orchestrator';

async function run(): Promise<void> {
  try {
    // Create & Init context
    const context = new ActionContext();

    // Check if content is known (Issue or PullRequest)
    if (context.content.type === ContentType.Unknown) {
      throw new Error('Error: Could not determinate Issue or PullRequest.');
    }

    // Load content
    await context.loadContent();

    // Run actions
    await Orchestrator.runActions(context);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
