/**
 * Helper functions for interacting with the runtime environment for the
 * application.
 *
 * @module env
 */

'use strict';

import * as proc from 'child_process';
import * as path from 'path';
import {SemVer} from 'semver';
import {popd, pushd} from 'util.chdir';
import {rstrip} from 'util.rstrip';

/** The package.json file of the module that imports this module */
const pkg = require(path.join(process.cwd(), 'package.json'));

export interface IEnvType {
	[key: string]: string;
}

export let envType: IEnvType = {
	DEV: 'development',
	TST: 'testing',
	PRD: 'production'
};

export let mode = envType.DEV;
export let branch = 'develop';
if (process.argv.indexOf('--development') !== -1) {
	mode = envType.DEV;
	branch = 'develop';
} else if (process.argv.indexOf('--testing') !== -1) {
	mode = envType.TST;
	branch = 'master';
} else if (process.argv.indexOf('--production') !== -1) {
	mode = envType.PRD;
}

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
	pushd(process.cwd());
	let revisionCount = rstrip(proc.execSync('git rev-list --no-merges --count HEAD').toString()) || 0;
	let buildNumber = process.env.BUILD_NUMBER || 0;
	popd();

	if (mode === envType.PRD) {
		let ver = new SemVer(pkg.version);
		let s: string = `${ver.major}.${ver.minor}.${ver.patch}`;
		branch = `v${s}`;

		return s;
	}

	return `${branch}-r${revisionCount}_b${buildNumber}`;
})();
