import {ActionContext} from '../context/context';
import {ActionBase, ActionResult} from './action_base';
import {Logger} from '../logs/logger';
import {IssuesRequests} from '../github/issues_requests';
import {Issue} from '../github/types';
import _ from 'lodash';

export class LabelAction extends ActionBase {
  get labelsToAdd(): string[] {
    return this.context.inputs.labels_add;
  }

  get labelsToRemove(): string[] {
    return this.context.inputs.labels_remove;
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
        this.log(`Current labels: ${labels.join(', ')}`);

        for (const label of this.labelsToAdd) {
          if (!labels.includes(label)) {
            labels.push(label);
          }
        }
        labels = labels.filter(value => !this.labelsToRemove.includes(value));

        const diffAdd = _.difference(
          labels,
          content.labels.map(label => label.name)
        );
        if (diffAdd.length) {
          this.log(`Adding labels: ${diffAdd.join(', ')}`);
        }
        const diffRemove = _.difference(
          content.labels.map(label => label.name),
          labels
        );
        if (diffAdd.length) {
          this.log(`Removing labels: ${diffRemove.join(', ')}`);
        }

        if (diffAdd || diffRemove) {
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
        } else {
          // No label to update
          this.log('No label to update');
          return ActionResult.Success;
        }
      } catch (error) {
        Logger.error(error);
        this.log(`Ended - Failed`);
        return ActionResult.Failed;
      }
    }
  }
}
