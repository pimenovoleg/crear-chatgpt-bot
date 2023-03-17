import { createContainer } from 'iti';

import { config } from './config';
import { createLogger } from './utils/log';

export const createAppContainer = () =>
    createContainer()
        .add({
            config: () => config
        })
        .add((items) => ({
            logger: () => createLogger(items.config)
        }));

export type Container = ReturnType<typeof createAppContainer>;

export const container = createAppContainer();
