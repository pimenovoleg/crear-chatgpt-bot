import { Middleware } from 'grammy';

import type { Context } from '@/bot/context';

const getChatInfo = (ctx: Context) => {
    if (ctx.chat != null) {
        const { id, type } = ctx.chat;

        return {
            chat: { id, type }
        };
    }

    return {};
};

const getSenderInfo = (ctx: Context) => {
    if (ctx.senderChat != null) {
        const { id, type } = ctx.senderChat;

        return {
            sender: { id, type }
        };
    }

    if (ctx.from != null) {
        const { id } = ctx.from;

        return {
            sender: { id }
        };
    }

    return {};
};

const getMetadata = (ctx: Context) => ({
    message_id: ctx.msg?.message_id,
    ...getChatInfo(ctx),
    ...getSenderInfo(ctx)
});

export const getFullMetadata = (ctx: Context) => ({
    ...ctx.update
});

export const logHandle =
    (id: string): Middleware<Context> =>
    (ctx, next) => {
        ctx.logger.info({
            msg: `handle ${id}`,
            ...(id === 'unhandled' ? getFullMetadata(ctx) : getMetadata(ctx))
        });

        return next();
    };
