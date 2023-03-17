import { chatAction } from '@grammyjs/auto-chat-action';
import { addReplyParam } from '@roziscoding/grammy-autoquote';
import { Composer } from 'grammy';

import { Context } from '@/bot/context';
import { logHandle } from '@/bot/helpers/logging';
import { getText } from '@/services/openai';

const composer = new Composer<Context>();
const feature = composer.chatType(['private', 'group']);

feature.command('chat', logHandle('command-chat'), chatAction('typing'), async (ctx) => {
    if (ctx.chat.type !== 'private') {
        ctx.api.config.use(addReplyParam(ctx));
    }

    const answer = await getText(ctx);

    await ctx.reply(answer);
});

export { composer as chatCommand };
