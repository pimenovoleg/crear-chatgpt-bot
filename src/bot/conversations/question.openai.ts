import { createConversation } from '@grammyjs/conversations';

import { Context, GrammyConversation } from '@/bot/context';
import { openai } from '@/services/openai';

async function questionOpenai(conversation: GrammyConversation, ctx: Context) {
    await ctx.replyWithChatAction('typing');

    await ctx.reply('Задай вопрос');

    const {
        message: { text }
    } = await conversation.waitFor('message:text');

    await ctx.replyWithChatAction('typing');

    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        temperature: 0.5,
        max_tokens: 4000,
        prompt: text
    });

    const response = completion.data.choices[0].text;
    if (response) {
        await ctx.reply(response);
    }
}

export const questionOpenaiConversation = createConversation(questionOpenai);
