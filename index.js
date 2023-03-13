import dotenv from 'dotenv';

dotenv.config();

import { getPic } from './services/stability.js';
import { log } from './utils/log.js';

import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

if (process.env.NODE_ENV === 'production') {
    const port = process.env.SERVER_PORT;
    const app = express();

    app.use(express.json());
    app.post(`/bot${process.env.TELEGRAM_TOKEN}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    app.listen(port, () => {
        console.log(`Express server is listening on ${port}`);
    });
}

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

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const msgLower = msg.text?.toLowerCase();

    log(`${msg.chat.username || msg.chat.first_name} (${chatId}): ${msgLower}`);

    if (msg.entities) {
        const command = bot.commands.get(msgLower.substring(1, msg.entities[0].length));

        if (!command) return;

        Object.assign(msg, {
            ...msg,
            bot: bot,
            reply: (text, options = {}) => bot.sendMessage(chatId, text, options),
            argStr: msgLower.substring(msg.entities[0].length + 1, msgLower.length)
        });

        try {
            command.run(msg);
        } catch (error) {
            log(error);
            msg.reply('There was an error while executing this command!');
        }
    }

    if (msgLower.startsWith('нарисуй') || msgLower.startsWith('draw')) {
        await textToVisual(chatId, msgLower, msg.from?.language_code);
    }
});

const textToVisual = async (chatId, text, language_code) => {
    await bot.sendChatAction(chatId, 'typing');

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

    const fileOptions = {
        filename: 'image',
        contentType: 'image/png'
    };

    await bot.sendPhoto(chatId, photo, fileOptions);
};

bot.on('polling_error', (error) => log(error));
bot.on('webhook_error', (error) => log(error));
