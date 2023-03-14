export default {
    data: {
        name: 'help',
        restricted: false
    },

    run(ctx) {
        const output = 'задай <любой вопрос>\nПопроси написать код\nDraw <something> (только на EN)';
        ctx.reply(output);
    }
};
