'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var askName = require('inquirer-npm-name');
var path = require('path');
var _ = require('lodash');
var githubTokenUser = require('github-token-user');

module.exports = yeoman.generators.Base.extend({
  _fetchCurrentUser: function(cb) {
    if (process.env.GITHUB_TOKEN) {
      githubTokenUser(process.env.GITHUB_TOKEN, function(err, user) {
        cb(err, user);
      });
    } else {
      process.nextTick(cb);
    }
  },
  initializing: function() {
    var done = this.async();
    this.props = {};

    this._fetchCurrentUser(function(err, user) {
      if (err) return done(err);

      if (user) {
        this.props.authorUrl = user.html_url;
        this.props.githubAccount = user.login;
        this.props.authorName = user.name;
        this.props.authorEmail = user.email;
      }

      done();
    }.bind(this));
  },
  prompting: {
    askForModuleName: function() {
      var done = this.async();

      askName({
        name: 'name',
        message: 'Module Name',
        default: path.basename(process.cwd()),
        filter: _.kebabCase,
        validate: function (str) {
          return str.length > 0;
        }
      }, this, function (name) {
        this.props.name = name;
        done();
      }.bind(this));
    },
    askFor: function() {
      var done = this.async();

      var prompts = [{
        name: 'description',
        message: 'Description'
      },
                     {
                       name: 'githubAccount',
                       message: 'GitHub username or organization',
                       default: this.props.githubAccount
                     }, {
                       name: 'authorName',
                       message: 'Author\'s Name',
                       default: this.props.authorName
                     }, {
                       name: 'authorEmail',
                       message: 'Author\'s Email',
                       default: this.props.authorEmail
                     }, {
                       name: 'authorUrl',
                       message: 'Author\'s Homepage',
                       default: this.props.authorUrl
                     }, {
                       name: 'keywords',
                       message: 'Package keywords (comma to split)',
                       filter: _.words
                     }];

      this.prompt(prompts, function (props) {
        this.props = _.merge(this.props, props);
        this.props.repository = props.githubAccount + '/' + this.props.name;

        done();
      }.bind(this));
    }
  },

  writing: function () {
    var props = this.props;

    this.fs.copy(
      this.templatePath('eslintrc'),
      this.destinationPath('.eslintrc')
    );

    this.fs.copy(
      this.templatePath('babelrc'),
      this.destinationPath('.babelrc')
    );

    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore')
    );

    this.fs.copy(
      this.templatePath('npmignore'),
      this.destinationPath('.npmignore')
    );

    this.fs.copy(
      this.templatePath('travis.yml'),
      this.destinationPath('.travis.yml')
    );

    this.fs.copyTpl(
      this.templatePath('test/*'),
      this.destinationPath('test'),
      {
        name: props.name,
        varName: _.camelCase(props.name)
      }
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      {
        name: props.name,
        varName: _.camelCase(props.name),
        githubAccount: props.githubAccount,
        description: props.description
      }
    );

    this.fs.copyTpl(
      this.templatePath('src/index.js'),
      this.destinationPath('src/index.js'),
      {
        varName: _.camelCase(props.name)
      }
    );

    var pkg = {
      name: _.kebabCase(props.name),
      version: '0.0.0',
      description: props.description,
      homepage: props.homepage,
      repository: props.repository,
      engines: {
        node: '>=0.12',
        npm: '^3.0.0'
      },
      author: {
        name: props.authorName,
        email: props.authorEmail,
        url: props.authorUrl
      },
      files: [
        'lib'
      ],
      license: 'MIT',
      main: 'lib/index.js',
      keywords: props.keywords,
      scripts: {
        build: 'babel src --out-dir lib --copy-files',
        lint: 'eslint src test',
        mocha: 'mocha --require babel-core/register --reporter spec test/**/*-test.js',
        prepublish: 'npm run build',
        test: 'npm run lint && npm run mocha',
        watch: 'npm run mocha -- -w'
      },
      devDependencies: {
        'babel-core': '^6.4.0',
        'babel-eslint': '^5.0.0-beta6',
        'babel-preset-es2015': '^6.3.13',
        'chai': '^3.2.0',
        'eslint': '^1.10.3',
        'mocha': '^2.3.0'
      }
    };

    this.fs.writeJSON('package.json', pkg);
  },
  install: function () {
    this.npmInstall(null, { silent: true });
    this.spawnCommand('npm', ['shrinkwrap', '--silent']);
  },
  end: function () {
    var repoSSH = 'git@github.com:' + this.props.repository + '.git';

    this.spawnCommand('git', ['init', '-q']);
    this.spawnCommand('git', ['remote', 'add', 'origin', repoSSH]);
    this.spawnCommand('git', ['add', '.']);
    this.spawnCommand('git', ['commit', '-m', 'Initial commit', '-q']);
  }
});
