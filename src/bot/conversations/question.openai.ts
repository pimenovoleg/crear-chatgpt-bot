import { Conversation, createConversation } from '@grammyjs/conversations';

import { Context } from '@/bot/context';
import { Container } from '@/container';
import { openai } from '@/services/openai';

export const questionToOpenaiConversation = (container: Container) =>
    createConversation(async (conversation: Conversation<Context>, ctx: Context) => {
        await ctx.replyWithChatAction('typing');

        await ctx.reply('Задай вопрос');

        const {
            message: { text }
        } = await conversation.waitFor('message:text');

        await ctx.replyWithChatAction('typing');

        const completion = await openai.createCompletion(
            {
                model: 'text-davinci-003',
                temperature: 0.5,
                max_tokens: 4000,
                prompt: text
            },
            { timeout: 20000 }
        );

        const response = completion.data.choices[0].text;
        if (response) {
            await ctx.reply(response);
        }

        await ctx.reply('что-то пошло не так, возможно слишком сложный вопрос для бота');
    }, 'question');
