// @ts-ignore
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mergeConfig } from 'vite';
import config from 'config-vite';

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(config(), {
	base: './',
	server: {
		fs: {
			allow: [appRoot, path.join(appRoot, 'assets')],
		},
	},
});