"use strict";

const debug = require("debug")("util.env.test");

import * as _ from "lodash";

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

beforeEach(() => {
	process.argv = _.cloneDeep(saveArgs);
	jest.resetModules();

	env = require("./index");
	delete process.env.NODE_ENV;

	expect(env).toBeTruthy();
	expect(process.env.env_mode).toBeFalsy();
});

test("Executing test for development environment", () => {
	process.argv.push("--development");
	env.show();

	expect(env.getMode()).toBe(env.EnvType.development);
	expect(env.isDevelopment()).toBe(true);
	expect(env.isTesting()).toBe(false);
	expect(env.isProduction()).toBe(false);
	expect(env.getBranch()).toBe("develop");

	const version = env.getVersion();
	expect(typeof version).toBe("string");
	expect(version).toMatch(r);
});

test("Executing test for testing environment", () => {
	process.argv.push("--testing");
	env.show(debug);

	expect(env.getMode()).toBe(env.EnvType.test);
	expect(env.isDevelopment()).toBe(false);
	expect(env.isTesting()).toBe(true);
	expect(env.isProduction()).toBe(false);
	expect(env.getBranch()).toBe("master");

	const version = env.getVersion();
	expect(typeof version).toBe("string");
	expect(version).toMatch(r);
});

test("Executing test for production environment", () => {
	process.argv.push("--production");
	env.show(debug);

	expect(env.getMode()).toBe(env.EnvType.production);
	expect(env.isDevelopment()).toBe(false);
	expect(env.isTesting()).toBe(false);
	expect(env.isProduction()).toBe(true);
	expect(env.getBranch()).toMatch(/v\d*.\d*.\d*/);

	const version = env.getVersion();
	expect(typeof version).toBe("string");
	expect(version).toMatch(r);
});

test("Executing test using environment variable test", () => {
	process.env["NODE_ENV"] = "blah";
	env.show(debug);

	expect(env.isDevelopment()).toBe(true);
	expect(env.isTesting()).toBe(false);
	expect(env.isProduction()).toBe(false);
	expect(env.getMode()).toBe(env.EnvType.development);
});
