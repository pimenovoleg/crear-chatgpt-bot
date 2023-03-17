import { autoChatAction } from '@grammyjs/auto-chat-action';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { Bot as TelegramBot, BotConfig, Context } from 'grammy';

import { chatCommand, startCommand } from '~/bot/commands';
import { drawCommand } from '~/bot/commands/draw.command';
import { createContextConstructor } from '~/bot/context';
import { errorHandler } from '~/bot/handlers';
import { i18n, updateLogger } from '~/bot/middlewares';
import { Container } from '~/container';

type Dependencies = {
    container: Container;
};

export const createBot = (
    token: string,
    { container }: Dependencies,
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
        { command: 'chat', description: 'Chat with OpenAI' },
        { command: 'draw', description: 'Draw images' }
    ]);

    if (config.isDev) {
        bot.use(updateLogger());
    }

    bot.use(autoChatAction());
    bot.use(hydrateReply);
    bot.use(hydrate());
    bot.use(i18n());

    bot.use(startCommand);
    bot.use(chatCommand);
    bot.use(drawCommand);

    if (config.isDev) {
        bot.catch(errorHandler);
    }

    return bot;
};

export type Bot = ReturnType<typeof createBot>;
