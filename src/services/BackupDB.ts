import fs from 'fs';
import path from 'path';
import { format, subDays } from 'date-fns';
import { CronJob } from 'cron';
import { resetDB } from '../db';


export class BackupDBService {
  constructor() {
    new CronJob('0 0 * * 4', this.callback, undefined, true, 'Europe/Amsterdam');
  }

  private async callback() {
    const now = new Date();
    const formatStr = 'yyMMdd';
    const from = format(subDays(now, 8), formatStr);
    const to = format(subDays(now, 2), formatStr);

    const fileName = `db_${from}-${to}.json`;

    fs.renameSync(path.resolve('db.json'), path.resolve('..', fileName));

    resetDB();
  }
}
