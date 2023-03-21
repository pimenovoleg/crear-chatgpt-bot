import { chatAction } from '@grammyjs/auto-chat-action';
import { addReplyParam } from '@roziscoding/grammy-autoquote';
import { Composer } from 'grammy';

import { Context } from '@/bot/context';
import { logHandle } from '@/bot/helpers/logging';
import { openai } from '@/services/openai';

const composer = new Composer<Context>();
const feature = composer.chatType(['private', 'group']);
const getRandomTokens = () => Math.floor(512 / (Math.floor(Math.random() * 6) + 1));

feature.command('q', logHandle('command-question'), chatAction('typing'), async (ctx) => {
    if (ctx.chat.type !== 'private') {
        ctx.api.config.use(addReplyParam(ctx));
    }

    const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        temperature: 0.5,
        max_tokens: getRandomTokens(),
        prompt: 'вопросик есть?'
    });

    const response = completion.data.choices[0].text;
    if (response) {
        await ctx.reply(response);
    }
});

export { composer as questionCommand };
