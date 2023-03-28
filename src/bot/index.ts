import { autoChatAction } from '@grammyjs/auto-chat-action';
import { conversations } from '@grammyjs/conversations';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { sequentialize } from '@grammyjs/runner';
import { Bot as TelegramBot, BotConfig, session, StorageAdapter } from 'grammy';

import { drawCommand, questionCommand, startCommand, translationCommand } from '@/bot/commands';
import { Context, createContextConstructor, getSessionKey, SessionData } from '@/bot/context';
import { drawConversation } from '@/bot/conversations/draw.conversation';
import { questionToOpenaiConversation } from '@/bot/conversations/question.openai';
import { translationConversation } from '@/bot/conversations/translation.conversation';
import { errorHandler } from '@/bot/handlers';
import { i18n, ignoreOldMessageUpdates, updateLogger } from '@/bot/middlewares';
import { Container } from '@/container';
import { openai } from '@/services/openai';

type Dependencies = {
    container: Container;
    sessionStorage: StorageAdapter<unknown>;
};

export const createBot = (
    token: string,
    { container, sessionStorage }: Dependencies,
    botConfig?: Omit<BotConfig<Context>, 'ContextConstructor'>
) => {
    const { config } = container.items;

    const bot = new TelegramBot(token, {
        ...botConfig,
        ContextConstructor: createContextConstructor(container)
    });

    bot.api.config.use(parseMode('HTML'));

    bot.api.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'question', description: 'Ask question OpenAI' },
        { command: 'draw', description: 'Draw images' },
        { command: 'translation', description: 'Перевод с RU на EN' }
    ]);

    if (config.isDev) {
        bot.use(updateLogger());
    }

    bot.use(autoChatAction());
    bot.use(hydrateReply);
    bot.use(hydrate());
    bot.use(i18n());
    bot.use(
        session({
            initial: (): SessionData => ({}),
            getSessionKey: (ctx) => ctx.chat?.id?.toString()
        })
    );
    bot.use(sequentialize(getSessionKey));
    bot.use(ignoreOldMessageUpdates);
    bot.use(conversations());

    // conversations
    bot.use(questionToOpenaiConversation(container));
    bot.use(drawConversation(container));
    bot.use(translationConversation(container));

    bot.use(startCommand);
    bot.use(questionCommand);
    bot.use(drawCommand);
    bot.use(translationCommand);

    if (config.isDev) {
        bot.catch(errorHandler);
    }

    bot.on('message:text', async (ctx: Context) => {
        const text = ctx.msg?.text;

        if (ctx.chat?.type === 'private' && text) {
            await ctx.replyWithChatAction('typing');

            const completion = await openai.createChatCompletion(
                {
                    model: 'gpt-3.5-turbo',
                    max_tokens: 4000,
                    messages: [{ role: 'user', content: text }]
                },
                { timeout: 20000 }
            );

            const response = completion.data.choices.at(0)?.message;
            if (response) {
                await ctx.reply(response.content);
            }
        }
    });

    return bot;
};

export type Bot = ReturnType<typeof createBot>;
