import express from 'express';
import { MemorySessionStorage, webhookCallback } from 'grammy';

import { createBot } from '@/bot';

import { container } from './container';

async function main() {
    const { config, logger } = container.items;

    const bot = createBot(config.BOT_TOKEN, {
        container,
        sessionStorage: new MemorySessionStorage()
    });

    if (config.isProd) {
        const app = express();
        app.use(express.json());

        app.use(
            `/${config.BOT_TOKEN}`,
            webhookCallback(bot, 'express', { onTimeout: () => console.log('timeout'), timeoutMilliseconds: 45000 })
        );

        app.listen(config.BOT_SERVER_PORT, async () => {
            console.log(`Bot listening on port ${config.BOT_SERVER_PORT}`);
            console.log(`Bot webhook ${config.BOT_WEBHOOK}`);

            await bot.api.setWebhook(`${config.BOT_WEBHOOK}/${config.BOT_TOKEN}`);
        });
    } else if (config.isDev) {
        await bot.api.deleteWebhook();

        await bot.init();

        await bot.start({
            allowed_updates: config.BOT_ALLOWED_UPDATES,
            onStart: ({ username }) =>
                logger.info({
                    msg: 'bot running...',
                    username
                })
        });
    }
}

main().catch((err) => {
    container.items.logger.error(err);
    process.exit(1);
});
