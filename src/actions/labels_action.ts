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
  }

  hasToRun(): boolean {
    return this.labelsToAdd.length !== 0 || this.labelsToRemove.length !== 0;
  }

  async run(): Promise<ActionResult | undefined> {
    if (this.hasToRun()) {
      try {
        this.log('Started');

        const content = this.context.content.issue as Issue;

        // Generate label list after Add & Remove
        let labels = content.labels.map(label => label.name);
        this.log(`Current labels: ${JSON.stringify(labels, null, '\t')}`);
        for (const label of this.labelsToAdd) {
          if (!labels.includes(labels)) {
            labels.push(label);
          }
        }
        labels = labels.filter(value => !this.labelsToRemove.includes(value));
        this.log(`Update labels to: ${JSON.stringify(labels, null, '\t')}`);

        // Update Issue labels
        if (this.needAsync) {
          await IssuesRequests.updateLabels(this.context, labels);
          this.log(`Ended - Success`);
          return ActionResult.Success;
        } else {
          IssuesRequests.updateLabels(this.context, labels as string[]);
          this.log(`Ended - Asynchronous - Still running`);
          return undefined;
        }
      } catch (error) {
        Logger.error(error);
        this.log(`Ended - Failed`);
        return ActionResult.Failed;
      }
    }
  }
}
