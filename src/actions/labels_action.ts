import {ActionContext} from '../context/context';
import {ActionBase, ActionResult} from './action_base';
import {Logger} from '../logs/logger';
import {IssuesRequests} from '../github/issues_requests';
import {Issue} from '../github/types';

export class LabelAction extends ActionBase {
  get labelsToAdd(): string[] {
    return this.context.inputs.labelsToAdd;
  }

  get labelsToRemove(): string[] {
    return this.context.inputs.labelsToRemove;
  }

  constructor(context: ActionContext) {
    super(context, false);
    Logger.debug('Label Action constructor');
  }

  hasToRun(): boolean {
    return this.labelsToAdd.length !== 0 || this.labelsToRemove.length !== 0;
  }

  async run(): Promise<ActionResult | undefined> {
    Logger.debug('Label Action run');
    if (this.hasToRun()) {
      try {
        const content = this.context.content.issue as Issue;

        // Generate label list after Add & Remove
        let labels = content.labels.map(label => label.name);
        for (const label of this.labelsToAdd) {
          if (!labels.includes(labels)) {
            labels.push(label);
          }
        }
        labels = labels.filter(value => !this.labelsToRemove.includes(value));
        Logger.debug('Label Action before update');

        // Update Issue labels
        if (this.needAsync) {
          await IssuesRequests.updateLabels(this.context, labels);
          return ActionResult.Success;
        } else {
          IssuesRequests.updateLabels(this.context, labels as string[]);
          return undefined;
        }
      } catch (error) {
        Logger.error(error);
        return ActionResult.Failed;
      }
    }
  }
}
