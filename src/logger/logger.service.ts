import { ConsoleLogger, Injectable } from '@nestjs/common';
import { appendFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MyLogger extends ConsoleLogger {
  private logsDir = join(__dirname, '..', 'logs');

  error(message: any) {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir);
      mkdirSync(join(this.logsDir, 'error'));
    } else if (!existsSync(join(this.logsDir, 'error'))) {
      mkdirSync(join(this.logsDir, 'error'));
    }
    const date = new Date();
    const day = this.getZero(date.getDate());
    const month = this.getZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hour = this.getZero(date.getHours());
    const min = this.getZero(date.getMinutes());
    const sec = this.getZero(date.getSeconds());
    const path = `src/logs/error/${year}-${month}-${day}.log`;
    const body = `[${this.context}] - [${hour}:${min}:${sec}]\nmessage:\n${message}\n>|\n`;
    appendFile(path, body, (err) => err);
    super.error(message);
  }

  private getZero(input: number): string {
    if (input < 10) return '0' + input;
    return input.toString();
  }
}
