import { conversations } from '../services/openai.js';

export default {
    data: {
        name: 'clean',
        restricted: false
    },

    run(ctx) {
        conversations.text = {};

        const output = 'Очистили беседы';
        ctx.reply(output);
    }
};
