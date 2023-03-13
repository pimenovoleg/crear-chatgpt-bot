import { log } from '../utils/log.js';

import { ChatGPTAPI } from 'chatgpt';
import dotenv from 'dotenv';

dotenv.config();

const openai = new ChatGPTAPI({
    apiKey: process.env.CHATGPT_API_KEY
});
export const conversations = {
    text: {}
};
export const getText = async (ctx) => {
    const lastConversation = conversations.text[ctx.message.from.id];

    const msg = ctx.message.text.substring(6);

    log('[ChatGPT] Parsed prompt from ' + ctx.message.from.id + ': ' + msg);

    let response;
    const start = Date.now();

    await ctx.api.sendChatAction(ctx.message.from.id, 'typing');

    if (lastConversation) {
        response = await openai.sendMessage(msg, lastConversation);
    } else {
        response = await openai.sendMessage(msg);
    }
    const end = Date.now() - start;

    log(`[ChatGPT] Answer to ${ctx.message.from.id}: ${response.text}`);

    conversations.text[ctx.message.from.id] = {
        conversationId: response.conversationId,
        parentMessageId: response.id
    };

    log(`[ChatGPT] ChatGPT response generation took ${end} ms`);

    ctx.reply(response.text);
};
