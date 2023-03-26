import { addReplyParam } from '@roziscoding/grammy-autoquote';
import { Composer } from 'grammy';

import { Context } from '@/bot/context';
import { logHandle } from '@/bot/helpers/logging';

const composer = new Composer<Context>();
const feature = composer.chatType(['private', 'group']);

feature.command('translation', logHandle('command-translation'), async (ctx) => {
    if (ctx.chat.type !== 'private') {
        ctx.api.config.use(addReplyParam(ctx));
    }

    await ctx.conversation.enter('translation');
});

export { composer as translationCommand };
