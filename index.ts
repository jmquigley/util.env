/**
 * Helper functions for interacting with the runtime environment for the
 * application.
 *
 * @module env
 */

'use strict';

import * as proc from 'child_process';
import * as fs from 'fs-extra';
import {SemVer} from 'semver';
import {popd, pushd} from 'util.chdir';
import {join} from 'util.join';
import {rstrip} from 'util.rstrip';

export interface EnvType {
	[key: string]: string;
}

export let envType: EnvType = {
	DEV: 'development',
	TST: 'test',
	PRD: 'production'
};

export let mode = process.env.ENV_MODE ? process.env.ENV_MODE : envType.DEV;
export let branch = 'develop';
if (process.argv.indexOf('--development') !== -1) {
	mode = envType.DEV;
	branch = 'develop';
} else if (process.argv.indexOf('--testing') !== -1 || process.argv.indexOf('--test') !== -1) {
	mode = envType.TST;
	branch = 'master';
} else if (process.argv.indexOf('--production') !== -1) {
	mode = envType.PRD;
}
export let root = process.cwd();

/**
 * Checks if the environment is development.
 * @returns {boolean} returns true if development, otherwise false.
 */
export function isDevelopment() {
	return mode === envType.DEV;
}

/**
 * Checks if the environment is testing.
 * @returns {boolean} returns true if testing, otherwise false.
 */
export function isTesting() {
	return mode === envType.TST;
}

/**
 * Checks if the environment is production.
 * @returns {boolean} returns true if production, otherwise false.
 */
export function isProduction() {
	return mode === envType.PRD;
}

/**
 * Builds the version label from the environment.  It determines the current
 * git branch, the number of revisions in that branch, and the build number
 * supplied by Jenkins.  If the build number is not found it is set to 0.  The
 * resulting version label is:
 *
 *     {branch}-r{# of revisions}_b{build number}
 *
 *     e.g.
 *
 *     develop-r05_b0
 *
 * When this is a production environment type, then the semver from the package
 * is used to create the version label.
 *
 * @returns {string} a string that represnets the
 */
export let version: string = (() => {

	const pkgfile = join(root, 'package.json');
	let pkg = {version: '0.0.0'};

	if (fs.existsSync(pkgfile)) {
		pkg = JSON.parse(fs.readFileSync(pkgfile, 'utf8'));
	}

	pushd(process.cwd());
	const revisionCount = rstrip(proc.execSync('git rev-list --no-merges --count HEAD').toString()) || 0;
	const buildNumber = process.env.BUILD_NUMBER || 0;
	popd();

	if (mode === envType.PRD) {
		const ver = new SemVer(pkg.version);
		const s: string = `${ver.major}.${ver.minor}.${ver.patch}`;
		branch = `v${s}`;

		return s;
	}

	return `${branch}-r${revisionCount}_b${buildNumber}`;
})();

/*
 * Prints debugging information about this environment to the console.
 * @param [log] {Object} a reference to the logging interface where the
 * messages will be written.  By default it is written to the console.
*/
export function show(log = console.log) {
	log('Mode: ' + mode);
	log('Version: ' + version);
	log('Branch: ' + branch);
	log('Root: ' + root);
}
