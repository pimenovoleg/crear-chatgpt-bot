import { NextFunction } from 'grammy';

import { Context } from '@/bot/context';

const threshold = 5 * 60; // 5 minutes
export const ignoreOldMessageUpdates = function (ctx: Context, next: NextFunction) {
    if (ctx.message) {
        if (new Date().getTime() / 1000 - ctx.message.date < threshold) {
            return next();
        } else {
            console.log(
                `Ignoring message from ${ctx.from?.id} at ${ctx.chat?.id} (${new Date().getTime() / 1000}:${
                    ctx.message.date
                })`
            );
        }
    } else {
        return next();
    }
};
