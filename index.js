import dotenv from 'dotenv';

dotenv.config();

import { getPic } from './services/stability.js';
import { log } from './utils/log.js';

import fs from 'fs';
import { Bot, InputFile, webhookCallback } from 'grammy';
import express from 'express';

const bot = new Bot(process.env.TELEGRAM_TOKEN);

bot.commands = new Map();

try {
    const commandFiles = fs.readdirSync('commands').filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = await import(`./commands/${file}`);
        bot.commands.set(command.default.data.name, command.default);
    }
} catch (error) {
    log('There was an error during command loading:', error);
}

bot.api.setMyCommands([
    {
        command: 'start',
        description: 'Start bot'
    },
    {
        command: 'help',
        description: 'Show help message'
    }
]);

bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id;
    const msgLower = ctx.msg.text?.toLowerCase();

    log(`${ctx.chat.username || ctx.chat.first_name} (${chatId}): ${msgLower}`);

    const entities = ctx.entities();

    if (entities.length > 0) {
        const command = bot.commands.get(msgLower.substring(1, entities[0].length));

        if (!command) return;

        Object.assign(ctx, {
            ...ctx,
            bot: bot,
            reply: (text, options = {}) => bot.api.sendMessage(chatId, text, options),
            argStr: msgLower.substring(entities[0].length + 1, msgLower.length)
        });

        try {
            command.run(ctx);
        } catch (error) {
            log(error);
            ctx.reply('There was an error while executing this command!');
        }
    }

    if (msgLower.startsWith('нарисуй') || msgLower.startsWith('draw')) {
        await textToVisual(chatId, msgLower, ctx.from?.language_code);
    }
});

const textToVisual = async (chatId, text, language_code) => {
    await bot.api.sendChatAction(chatId, 'typing');

    // if (
    //     process.env.GOOGLE_KEY &&
    //     ((language_code === 'ru' && !text?.startsWith('draw')) || text?.startsWith('нарисуй'))
    // ) {
    //     text = await translate(text, 'en');
    // }

    const photo = await getPic(
        text +
            (text?.startsWith('draw')
                ? ''
                : ', deep focus, highly detailed, digital painting, artstation, 4K, smooth, sharp focus, illustration')
    );

    await bot.api.sendPhoto(chatId, new InputFile(photo, 'image'));
};

bot.catch((error) => {
    log('ERROR on handling update occurred', error);
});

if (process.env.NODE_ENV === 'production') {
    const port = process.env.SERVER_PORT;
    const app = express();

    app.use(express.json());
    app.use(webhookCallback(bot, 'express'));

    const server = app.listen(port, () => {
        log(`Express server is listening on ${port}`);
    });

    process.on('SIGTERM', async () => {
        server.close();
        await bot.stop();
        process.exit(0);
    });
} else {
    bot.start();
}
