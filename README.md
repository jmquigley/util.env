# util.env

> Manages environment type and version strings for a project.

[![build](https://github.com/jmquigley/util.env/workflows/build/badge.svg)](https://github.com/jmquigley/util.env/actions)
[![analysis](https://img.shields.io/badge/analysis-tslint-9cf.svg)](https://palantir.github.io/tslint/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![testing](https://img.shields.io/badge/testing-jest-blue.svg)](https://facebook.github.io/jest/)
[![NPM](https://img.shields.io/npm/v/util.env.svg)](https://www.npmjs.com/package/util.env)

This module contains helper functions for interacting with the application runtime environment to determine its type.  It has three types of environments:

- Development
- Test
- Production


## Installation

This module uses [yarn](https://yarnpkg.com/en/) to manage dependencies and run scripts for development.

To install as an application dependency:
```
$ yarn add --dev util.env
```

To build the app and run all tests:
```
$ yarn run all
```


## Usage
This module is generally used during the build process under CI to identify the type of build being performed.  The mode is determined in one of two ways.

1. NODE_ENV environment variable set to `development`, `test`, or `production`.
2. A command line option

The command line arguments passed to the build used to determine the type are:

- `--development`
- `--testing`
- `--production`


## API

It exposes the following functions that can be used within the build:

- `getBranch()` - retrieves the git branch name for this package for that mode
- `getMode()` - gets the current mode string (development, test, production)
- `getVersion()` - gets the version string associate with this mode
- `isDevelopment()` - the '--development' flag was passed.
- `isTesting()` - the '--testing' flag was passed
- `isProduction()` - the '--production' flag was passed
- `show()` - prints debug information to the console.


The use of this module also exposes the `getVersion` function.  When this function is called it will determine the type and build the corresponding version string.  When the environment is development or testing the string is:

```
{branch}_r{revision count}-b{build number}
```

Where *branch* is the name of the branch where this build is occuring.  In development this is usually the `develop` branch.  When it is the testing environment it is usually the `master`.  The *revision count* is computed from git.  It counts the number of revisions associated with that branch.  The *build number* is retrieved from the environment.  In Jenkins this is an environment variable set to `$BUILD_NUMBER`.  This script assumes Jenkins.

When the environment is production the string uses [semver](http://semver.org/).

```
{major}.{minor}.{revision count}
```

The `major` and `minor` versions are retrieved from `package.json`.  The revision count is computed from git (the same as testing/development).
