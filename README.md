# util.env [![Build Status](https://travis-ci.org/jmquigley/util.env.svg?branch=master)](https://travis-ci.org/jmquigley/util.env) [![tslint code style](https://img.shields.io/badge/code_style-TSlint-5ed9c7.svg)](https://palantir.github.io/tslint/) [![Test Runner](https://img.shields.io/badge/testing-ava-blue.svg)](https://github.com/avajs/ava) [![NPM](https://img.shields.io/npm/v/util.env.svg)](https://www.npmjs.com/package/util.env) [![Coverage Status](https://coveralls.io/repos/github/jmquigley/util.env/badge.svg?branch=master)](https://coveralls.io/github/jmquigley/util.env?branch=master)

> Manages environment type and version strings for a project.

This module contains helper functions for interacting with the runtime environment for an application to determine they type of environment.  The application that uses this script will have three types of environments:

- Development
- Testing
- Production


## Installation

To install as an application dependency:
```
$ npm install --save util.env
```

To build the app and run all tests:
```
$ npm run all
```


## Usage
This module is generally used during the build process under CI to identify the type of build being performed.  It uses command line arguments passed to the build to determine the type:

- `--development`
- `--testing`
- `--production`

It exposes four functions that can be used within the build:

- `isDevelopment()` - the '--development' flag was passed.
- `isTesting()` - the '--testing' flag was passed
- `isProduction()` - the '--production' flag was passed
- `show()` - prints debug information to the console.

The type can also be set using the environment variable `ENV_MODE`.  This is used to set the default value for the exposed `mode` variable.

The use of this module also exposes the `version` string.  When this module is included it will determine the type and build the corresponding version string.  When the environment is development or testing the string is:

```
{branch}_r{revision count}-b{build number}
```

Where *branch* is the name of the branch where this build is occuring.  In development this is usually the `develop` branch.  When it is the testing environment it is usually the `master`.  The *revision count* is computed from git.  It counts the number of revisions associated with that branch.  The *build number* is retrived from the environment.  In Jenkins this is an environment variable set to `$BUILD_NUMBER`.  This script assumes Jenkins.

When the environment is production the string uses [semver](http://semver.org/).

```
{major}.{minor}.{revision count}
```

The `major` and `minor` versions are retrieved from `package.json`.  The revision count is computed from git (the same as testing/development).