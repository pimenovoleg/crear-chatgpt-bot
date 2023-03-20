import { type ChatMessage, ChatGPTAPI } from 'chatgpt';
import dotenv from 'dotenv';

import { Context } from '@/bot/context';

dotenv.config();

export const getText = async (ctx: Context): Promise<string> => {
    const openai = new ChatGPTAPI({
        apiKey: process.env.CHATGPT_API_KEY || ''
    });

    const msg = ctx.message?.text || '';

    const response: ChatMessage = await openai.sendMessage(msg, {
        timeoutMs: 2 * 60 * 1000
    });

    return response.text || '';
};
