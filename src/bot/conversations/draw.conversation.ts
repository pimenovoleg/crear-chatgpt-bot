import { createConversation } from '@grammyjs/conversations';
import { InputFile } from 'grammy';

import { Context, GrammyConversation } from '@/bot/context';
import { getPic } from '@/services/stability';

async function draw(conversation: GrammyConversation, ctx: Context) {
    await ctx.replyWithChatAction('typing');

    await ctx.reply('Опиши, что мне нарисовать. Пока смогу тебя понять только на английском.');

    const {
        message: { text }
    } = await conversation.waitFor('message:text');

    await ctx.replyWithChatAction('typing');

    const picture = await getPic(
        `${text}, deep focus, highly detailed, digital painting, artstation, 4K, smooth, sharp focus, illustration`
    );

    if (picture && ctx.chat != null) {
        await ctx.api.sendPhoto(ctx.chat.id, new InputFile(picture, 'image'));
    } else {
        await ctx.reply(`${ctx.t('start_command.hello')}`);
    }
}

export const drawConversation = createConversation(draw);
