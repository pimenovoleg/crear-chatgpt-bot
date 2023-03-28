import { run } from '@grammyjs/runner';
import { MemorySessionStorage } from 'grammy';

import { createBot } from '@/bot';
import { createServer } from '@/server';

import { container } from './container';

async function main() {
    const { config, logger } = container.items;

    const bot = createBot(config.BOT_TOKEN, {
        container,
        sessionStorage: new MemorySessionStorage()
    });

    //const server = await createServer(bot, container);

    if (config.isProd) {
        // server.listen(config.BOT_SERVER_PORT, async () => {
        //     console.log(`Bot listening on port ${config.BOT_SERVER_PORT}`);
        //     console.log(`Bot webhook ${config.BOT_WEBHOOK}`);
        //
        //     // await bot.api.setWebhook(`${config.BOT_WEBHOOK}/${config.BOT_WEBHOOK_SECRET}`);
        // });

        run(bot);
    } else if (config.isDev) {
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
