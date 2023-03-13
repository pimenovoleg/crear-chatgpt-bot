import chalk from 'chalk';
import { DateTime } from 'luxon';

export const log = (...args) => console.log(chalk.gray(DateTime.now()), ...args);
