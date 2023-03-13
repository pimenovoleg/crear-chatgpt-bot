export default {
    data: {
        name: 'help',
        restricted: false
    },

    run(ctx) {
        const language_code = ctx.from?.language_code;
        const output =
            language_code === 'ru'
                ? 'Нарисуй <что-то>\nЗагугли/Погугли <что-то>\nСброс\nТемпература 36.5 - 41.5\nПропуск <x>\nОтвечай\nРежим <притворись что ты ...>\nЧерез английский <запрос>'
                : 'Paint <some>\nDraw <some>\nGoogle <some>\nReset\nTemperature 36.5 - 41.5\nSkip <x>\nAnswer\nMode <pretend you are ...>';

        ctx.reply(output);
    }
};
