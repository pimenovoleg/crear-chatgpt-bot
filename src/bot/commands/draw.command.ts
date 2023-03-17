import { chatAction } from '@grammyjs/auto-chat-action';
import { addReplyParam } from '@roziscoding/grammy-autoquote';
import { Composer, InputFile } from 'grammy';

import { Context } from '@/bot/context';
import { logHandle } from '@/bot/helpers/logging';
import { getPic } from '@/services/stability';

const composer = new Composer<Context>();
const feature = composer.chatType(['private', 'group']);

feature.command('draw', logHandle('command-draw'), chatAction('typing'), async (ctx) => {
    if (ctx.chat.type !== 'private') {
        ctx.api.config.use(addReplyParam(ctx));
    }

    const picture = await getPic(
        `${ctx.message.text}, deep focus, highly detailed, digital painting, artstation, 4K, smooth, sharp focus, illustration`
    );

    if (picture) {
        await ctx.api.sendPhoto(ctx.chat.id, new InputFile(picture, 'image'));
    } else {
        await ctx.reply(`${ctx.t('start_command.hello')}`);
    }
});

export { composer as drawCommand };
