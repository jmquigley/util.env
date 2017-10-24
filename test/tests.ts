'use strict';

const debug = require('debug')('util.env.test');

import test from 'ava';
import * as _ from 'lodash';

const saveArgs = _.cloneDeep(process.argv);
let env: any = null;

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

	env = require('../index');
	delete process.env.ENV_MODE;

	t.truthy(env);
	t.falsy(process.env.env_mode);
});

test('Executing test for development environment', t => {
	process.argv.push('--development');
	env.show(debug);

	t.is(env.getMode(), env.EnvType.development);
	t.true(env.isDevelopment());
	t.false(env.isTesting());
	t.false(env.isProduction());
	t.is(env.getBranch(), 'develop');

	const version = env.getVersion();
	t.is(typeof version, 'string');
	t.regex(version, r);
});

test('Executing test for testing environment', t => {
	process.argv.push('--testing');
	env.show(debug);

	t.is(env.getMode(), env.EnvType.test);
	t.false(env.isDevelopment());
	t.true(env.isTesting());
	t.false(env.isProduction());
	t.is(env.getBranch(), 'master');

	const version = env.getVersion();
	t.is(typeof version, 'string');
	t.regex(version, r);
});

test('Executing test for production environment', t => {
	process.argv.push('--production');
	env.show(debug);

	t.is(env.getMode(), env.EnvType.production);
	t.false(env.isDevelopment());
	t.false(env.isTesting());
	t.true(env.isProduction());
	t.regex(env.getBranch(), /v\d*.\d*.\d*/);

	const version = env.getVersion();
	t.is(typeof version, 'string');
	t.regex(version, r);
});

test('Executing test using environment variable test', t => {
	process.env['ENV_MODE'] = 'blah';
	env.show(debug);

	t.true(env.isDevelopment());
	t.false(env.isTesting());
	t.false(env.isProduction());
	t.is(env.getMode(), env.EnvType.development);
});
