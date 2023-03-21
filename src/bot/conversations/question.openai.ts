import { createConversation } from '@grammyjs/conversations';

import { Context, GrammyConversation } from '@/bot/context';
import { openai } from '@/services/openai';

const getRandomTokens = () => Math.floor(512 / (Math.floor(Math.random() * 6) + 1));

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
        max_tokens: getRandomTokens(),
        prompt: text
    });

    await ctx.replyWithChatAction('typing');

    const response = completion.data.choices[0].text;
    if (response) {
        await ctx.reply(response);
    }
}

export const questionOpenaiConversation = createConversation(questionOpenai);
