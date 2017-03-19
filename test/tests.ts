'use strict';

import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import {Fixture} from 'util.fixture';
import {debug} from './helpers';

let saveArgs = _.cloneDeep(process.argv);

/**
 * This regex defins a pattern that validates the build version
 * string.
 *
 * {branch}-r{revision count}_b{build number}
 *
 * OR
 *
 * {major}.{minor}.{incremental}
 *
 * e.g.
 *
 * master_r1_b2
 * 0.0.1
 *
 * @type {RegExp}
 */
let regex = /.*-r\d+_b\d+|\d+\.\d+\.\d+/;

describe('Executing test suite', () => {

	after(() => {
		debug('final cleanup: test_artifacts');
		let directories = Fixture.cleanup();
		directories.forEach((directory: string) => {
			assert(!fs.existsSync(directory));
		});
	});

	beforeEach(() => {
		process.argv = _.cloneDeep(saveArgs);
		delete require.cache[require.resolve('../index')];
	});

	it('Executing test for development environment', () => {
		process.argv.push('--development');
		let env = require('../index');

		assert(env.isDevelopment());
		assert(!env.isTesting());
		assert(!env.isProduction());
		assert(env.mode === env.envType.DEV);
		assert(typeof env.version === 'string');
		assert(regex.test(env.version));
	});

	it('Executing test for testing environment', () => {
		process.argv.push('--testing');
		let env = require('../index');

		assert(!env.isDevelopment());
		assert(env.isTesting());
		assert(!env.isProduction());
		assert(env.mode === env.envType.TST);
		assert(typeof env.version === 'string');
		assert(regex.test(env.version));
	});

	it('Executing test for production environment', () => {
		process.argv.push('--production');
		let env = require('../index');

		assert(!env.isDevelopment());
		assert(!env.isTesting());
		assert(env.isProduction());
		assert(env.mode === env.envType.PRD);
		assert(typeof env.version === 'string');
		assert(regex.test(env.version));
	});
});
