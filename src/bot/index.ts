import { autoChatAction } from '@grammyjs/auto-chat-action';
import { conversations } from '@grammyjs/conversations';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { Bot as TelegramBot, BotConfig, session, StorageAdapter } from 'grammy';

import { drawCommand, questionCommand, startCommand } from '@/bot/commands';
import { Context, createContextConstructor, SessionData } from '@/bot/context';
import { drawConversation } from '@/bot/conversations/draw.conversation';
import { questionToOpenaiConversation } from '@/bot/conversations/question.openai';
import { errorHandler } from '@/bot/handlers';
import { i18n, updateLogger } from '@/bot/middlewares';
import { Container } from '@/container';

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
        { command: 'draw', description: 'Draw images' }
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
            getSessionKey: (ctx) => ctx.from?.id?.toString()
        })
    );
    bot.use(conversations());

    // conversations
    bot.use(questionToOpenaiConversation(container));
    bot.use(drawConversation(container));

    bot.use(startCommand);
    bot.use(questionCommand);
    bot.use(drawCommand);

    if (config.isDev) {
        bot.catch(errorHandler);
    }

    return bot;
};

export type Bot = ReturnType<typeof createBot>;
