import 'module-alias/register';

import express from 'express';
import { webhookCallback } from 'grammy';

import { createBot } from '@/bot';

import { container } from './container';

async function main() {
    const { config, logger } = container.items;

    const bot = createBot(config.BOT_TOKEN, {
        container
    });

    if (config.isProd) {
        await bot.api.setWebhook(`${config.BOT_WEBHOOK}`);

        const app = express();
        app.use(express.json());

        app.use(
            webhookCallback(bot, 'express', { onTimeout: () => console.log('timeout'), timeoutMilliseconds: 45000 })
        );

        app.listen(config.BOT_SERVER_PORT, () => {
            console.log(`Bot listening on port ${config.BOT_SERVER_PORT}`);
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
