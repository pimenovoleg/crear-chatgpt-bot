import fastifyCors from '@fastify/cors';
import fastify from 'fastify';
import { BotError, webhookCallback } from 'grammy';

import type { Bot } from '@/bot';
import { errorHandler } from '@/bot/handlers';
import type { Container } from '@/container';

export const createServer = async (bot: Bot, container: Container) => {
    const { logger } = container.items;

    const server = fastify({
        logger,
        trustProxy: true
    });

    server.register(fastifyCors, { origin: '*' });

    server.setErrorHandler(async (error, req, res) => {
        if (error instanceof BotError) {
            errorHandler(error);

            await res.code(200).send({});
        } else {
            logger.error(error);

            await res.status(500).send({ error: 'Oops! something went wrong.' });
        }
    });

    server.post(`/${bot.token}`, webhookCallback(bot, 'fastify', { timeoutMilliseconds: 30000 }));

    return server;
};
