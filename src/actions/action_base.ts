import {ActionContext} from '../context/context';
import {Logger} from '../logs/logger';

export enum ActionResult {
  Success,
  Failed
}

export abstract class ActionBase {
  private _context: ActionContext;
  private _needAsync: boolean;

  get context(): ActionContext {
    return this._context;
  }

  get needAsync(): boolean {
    return this._needAsync;
  }

  constructor(context: ActionContext, needAsync = false) {
    this._context = context;
    this._needAsync = needAsync;
  }

  log(message: string): void {
    Logger.debug(`${typeof this}: ${message}`);
  }

  abstract hasToRun(): boolean;
  abstract run(): Promise<ActionResult | undefined>;
}
