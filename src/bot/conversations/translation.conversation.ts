import { Conversation, createConversation } from '@grammyjs/conversations';
import { ChatCompletionRequestMessage } from 'openai';

import { Context } from '@/bot/context';
import { i18n } from '@/bot/middlewares';
import { Container } from '@/container';
import { openai } from '@/services/openai';

export const translationConversation = (container: Container) =>
    createConversation(async (conversation: Conversation<Context>, ctx: Context) => {
        await conversation.run(i18n());

        await ctx.replyWithChatAction('typing');
        await ctx.reply('Напиши текст, который надо перевести с RU на EN');

        const {
            message: { text }
        } = await conversation.waitFor('message:text');

        const messages: ChatCompletionRequestMessage[] = [
            {
                role: 'system',
                content: `
        You are a helpful translator, you will help to translate the user's text to English, only return the translated text, do not markup the answer. Don't change the punctuation. Do not translate code blocks or links.
        `
            },
            {
                role: 'user',
                content: `Translate the following markdown text: \\n\\n ${text}`
            }
        ];

        const { data } = await openai.createChatCompletion(
            {
                model: 'gpt-3.5-turbo',
                messages
            },
            { timeout: 20000 }
        );

        const response = data.choices.pop()?.message?.content?.trim();

        if (response) {
            return await ctx.reply(response);
        }

        await ctx.reply(ctx.t('error.smth_wrong'));
    }, 'translation');
