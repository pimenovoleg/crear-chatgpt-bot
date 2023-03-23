import express from 'express';
import { webhookCallback } from 'grammy';

import { Bot } from '@/bot';
import { Container } from '@/container';
import { errorMiddleware } from '@/server/middleware/';

export const createServer = async (bot: Bot, container: Container) => {
    const { config } = container.items;

    const app = express();
    app.use(express.json());

    app.use(errorMiddleware);

    app.use(`/${config.BOT_WEBHOOK_SECRET}`, webhookCallback(bot, 'express'));

    return app;
};
