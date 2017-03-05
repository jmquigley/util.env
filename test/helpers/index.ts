/**
 *  Throwaway test helper functions that are shared between tests
 */

'use strict';

const pkg = require('../../package.json');

export function debug(message: string): void {
	if (pkg.debug) {
		console.log(message);
	}
}
