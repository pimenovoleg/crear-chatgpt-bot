import { AutoChatActionFlavor } from '@grammyjs/auto-chat-action';
import { HydrateFlavor } from '@grammyjs/hydrate';
import { I18nFlavor } from '@grammyjs/i18n';
import { ParseModeFlavor } from '@grammyjs/parse-mode';
import { Update, UserFromGetMe } from '@grammyjs/types';
import { Api, Context as DefaultContext } from 'grammy';

import type { Container } from '~/container';
import { Logger } from '~/utils/log';

type ExtendedContextFlavor = {
    container: Container;
    logger: Logger;
};

export type Context = ParseModeFlavor<
    HydrateFlavor<DefaultContext & ExtendedContextFlavor & I18nFlavor & AutoChatActionFlavor>
>;
export function createContextConstructor(container: Container) {
    return class extends DefaultContext implements ExtendedContextFlavor {
        container: Container;

        logger: Logger;

        constructor(update: Update, api: Api, me: UserFromGetMe) {
            super(update, api, me);

            this.container = container;
            this.logger = container.items.logger.child({
                update_id: this.update.update_id
            });
        }
    } as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
