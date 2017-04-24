'use strict';

import test from 'ava';
import * as _ from 'lodash';

const saveArgs = _.cloneDeep(process.argv);

/**
 * This regex defines a pattern that validates the build version
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
const r = /.*-r\d+_b\d+|\d+\.\d+\.\d+/;

test.beforeEach(t => {
	process.argv = _.cloneDeep(saveArgs);
	delete require.cache[require.resolve('../index')];
	t.pass();
});

test('Executing test for development environment', t => {
	process.argv.push('--development');
	const env = require('../index');

	env.show();

	t.true(env.isDevelopment());
	t.false(env.isTesting());
	t.false(env.isProduction());
	t.is(env.mode, env.envType.DEV);
	t.is(typeof env.version, 'string');
	t.regex(env.version, r);
});

test('Executing test for testing environment', t => {
	process.argv.push('--testing');
	const env = require('../index');

	env.show();

	t.false(env.isDevelopment());
	t.true(env.isTesting());
	t.false(env.isProduction());
	t.is(env.mode, env.envType.TST);
	t.is(typeof env.version, 'string');
	t.regex(env.version, r);
});

test('Executing test for production environment', t => {
	process.argv.push('--production');
	const env = require('../index');

	env.show();

	t.false(env.isDevelopment());
	t.false(env.isTesting());
	t.true(env.isProduction());
	t.is(env.mode, env.envType.PRD);
	t.is(typeof env.version, 'string');
	t.regex(env.version, r);
});

test('Executing test using environment variable test', t => {
	process.env['ENV_MODE'] = 'blah';
	const env = require('../index');

	env.show();
	t.false(env.isDevelopment());
	t.false(env.isTesting());
	t.false(env.isProduction());
	t.is(env.mode, 'blah');
});
