import {ActionContext} from '../context/context';
import {Logger} from '../logs/logger';
import {LabelAction} from './labels_action';
import {ProjectAction} from './project_action';

export class Orchestrator {
  static actionTypes = [LabelAction, ProjectAction];

  static async runActions(context: ActionContext): Promise<void> {
    Logger.debug('orchestrator.runActions');
    for (const actionType of Orchestrator.actionTypes) {
      const action = new actionType(context);

      if (action.hasToRun()) {
        await action.run();
      }
    }
  }
}
