/**
 * Helper functions for interacting with the runtime environment for the
 * application.
 *
 * @module env
 */

const debug = require("debug")("util.env");

import * as proc from "child_process";
import * as fs from "fs-extra";
import {SemVer} from "semver";
import {popd, pushd} from "util.chdir";
import {join} from "util.join";
import {rstrip} from "util.rstrip";

export enum EnvType {
	development = "development",
	test = "test",
	production = "production"
}

export const root = process.cwd();

/**
 * Retrieves a string that represents the name of a branch in git for a
 * mode.
 *
 * - development => "develop"
 * - test => "master"
 * - production => "v##.##.##"
 */
export function getBranch(): string {
	const mode: string = getMode();

	if (mode === EnvType.test) {
		return "master";
	} else if (mode === EnvType.production) {
		return `v${getVersion()}`;
	}

	return "develop";
}

/**
 * Retrieves the environment mode type.  There are three types:
 *
 * - development
 * - test
 * - production
 *
 * It will first try to get the type from the NODE_ENV variable.  If this
 * is not found, then it will look for the a command line argument for the
 * type.  If this is not found, then the default of "development" is
 * returned.
 */
export function getMode(): string {
	debug("process.env.NODE_ENV: %s", process.env.NODE_ENV);

	if (process.env.NODE_ENV == null) {
		process.env.NODE_ENV = EnvType.development;
		if (
			process.argv.indexOf("--testing") !== -1 ||
			process.argv.indexOf("--test") !== -1
		) {
			process.env.NODE_ENV = EnvType.test;
		} else if (process.argv.indexOf("--production") !== -1) {
			process.env.NODE_ENV = EnvType.production;
		}
	}

	return EnvType[process.env.NODE_ENV] || EnvType.development;
}

/**
 * Checks if the environment is development.
 * @returns {boolean} returns true if development, otherwise false.
 */
export function isDevelopment(): boolean {
	return getMode() === EnvType.development;
}

/**
 * Checks if the environment is testing.
 * @returns {boolean} returns true if testing, otherwise false.
 */
export function isTesting(): boolean {
	return getMode() === EnvType.test;
}

/**
 * Checks if the environment is production.
 * @returns {boolean} returns true if production, otherwise false.
 */
export function isProduction(): boolean {
	return getMode() === EnvType.production;
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
export function getVersion() {
	const pkgfile = join(root, "package.json");
	let pkg = {version: "0.0.0"};

	if (fs.existsSync(pkgfile)) {
		pkg = JSON.parse(fs.readFileSync(pkgfile, "utf8"));
	}

	pushd(process.cwd());
	const revisionCount =
		rstrip(
			proc.execSync("git rev-list --no-merges --count HEAD").toString()
		) || 0;
	const buildNumber = process.env.BUILD_NUMBER || 0;
	popd();

	if (getMode() === EnvType.production) {
		const ver = new SemVer(pkg.version);
		const s: string = `${ver.major}.${ver.minor}.${ver.patch}`;
		return s;
	}

	return `${getBranch()}-r${revisionCount}_b${buildNumber}`;
}

/*
 * Prints debugging information about this environment to the console.
 * @param [log] {Object} a reference to the logging interface where the
 * messages will be written.  By default it is written to the console.
 */
export function show(log = console.log) {
	log("Mode: " + getMode());
	log("Version: " + getVersion());
	log("Branch: " + getBranch());
	log("Root: " + root);
}
