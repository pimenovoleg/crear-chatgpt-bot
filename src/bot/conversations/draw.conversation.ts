import { Conversation, createConversation } from '@grammyjs/conversations';
import { InputFile } from 'grammy';

import { Context } from '@/bot/context';
import { i18n } from '@/bot/middlewares';
import { Container } from '@/container';
import { getPic } from '@/services/stability';

export const drawConversation = (container: Container) =>
    createConversation(async (conversation: Conversation<Context>, ctx: Context) => {
        await conversation.run(i18n());

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
    }, 'draw');
