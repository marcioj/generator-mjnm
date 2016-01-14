'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var sinon = require('sinon');

describe('mjnm:app', function () {
  this.timeout(10000);

  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true })
      .withPrompts({ someOption: true })
      .on('ready', function(generator) {
        sinon.stub(generator, '_fetchCurrentUser', function(cb) {
          cb(null);
        });
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'package.json',
      '.travis.yml',
      '.eslintrc',
      '.npmignore',
      '.gitignore',
      '.babelrc',
      'README.md',
      'test/index-test.js',
      'test/mocha.opts',
      'src/index.js'
    ]);
  });
});
