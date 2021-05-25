import * as core from '@actions/core';

export class Logger {
  static error(value: string | Error): void {
    core.error(value);
  }

  static debug(value: string): void {
    core.debug(value);
  }

  static debugOject<T>(name: string, object: T): void {
    this.debug(`${name}\n${JSON.stringify(object, null, '\t')}`);
  }

  static debugData<T>(name: string, data: T): void {
    this.debug(`${name}: ${data}`);
  }
}
