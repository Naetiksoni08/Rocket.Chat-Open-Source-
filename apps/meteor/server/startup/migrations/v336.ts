import { addMigration } from '../../lib/migrations';

addMigration({
	version: 336,
	name: 'Placeholder migration',
	async up() {
		// no-op
	},
});