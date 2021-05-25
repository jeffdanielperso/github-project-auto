import {ActionContext} from '../context/context';
import {LabelAction} from './labels_action';
import {ProjectAction} from './project_action';

export class Orchestrator {
  static actionTypes = [LabelAction, ProjectAction];

  static async runActions(context: ActionContext): Promise<void> {
    for (const actionType of Orchestrator.actionTypes) {
      const action = new actionType(context);

      if (action.hasToRun()) {
        await action.run();
      }
    }

    return;
  }
}
