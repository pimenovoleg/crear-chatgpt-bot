import { addReplyParam } from '@roziscoding/grammy-autoquote';
import { Composer } from 'grammy';
import stripIndent from 'strip-indent';

import { Context } from '~/bot/context';
import { logHandle } from '~/bot/helpers/logging';

const composer = new Composer<Context>();
const feature = composer.chatType(['private', 'group']);

feature.command('start', logHandle('command-start'), async (ctx) => {
    if (ctx.chat.type !== 'private') {
        ctx.api.config.use(addReplyParam(ctx));
    }

    await ctx.reply(
        stripIndent(`
	${ctx.t('start_command.hello')}
    ${
        ctx.chat.type === 'private'
            ? 'Simply send messages to chat.'
            : 'Use /chat **message** or reply to my messages to chat.'
    }`)
    );
});

export { composer as startCommand };
