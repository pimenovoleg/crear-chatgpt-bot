import dotenv from 'dotenv';

import { Context } from '@/bot/context';

dotenv.config();

export const getText = async (ctx: Context): Promise<string> => {
    const { ChatGPTAPI } = await import('chatgpt');

    const openai = new ChatGPTAPI({
        apiKey: process.env.CHATGPT_API_KEY || ''
    });

    const msg = ctx.message?.text || '';

    const response = await openai.sendMessage(msg, {
        timeoutMs: 2 * 60 * 1000
    });

    return response.text || '';
};
