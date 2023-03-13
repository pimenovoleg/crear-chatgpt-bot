export default {
    data: {
        name: 'help',
        restricted: false
    },

    run(ctx) {
        const language_code = ctx.from?.language_code;
        const output =
            language_code === 'ru' ? 'Нарисуй <что-то>\nЗагугли/Погугли <что-то>' : 'Draw <some>\nGoogle <some>';

        ctx.reply(output);
    }
};
