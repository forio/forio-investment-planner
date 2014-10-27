'use strict';

var _ = require('lodash');
var minifyify = require('minifyify');

module.exports = function (grunt) {
    var scripts = grunt.config.get('scripts');

    grunt.loadNpmTasks('grunt-browserify');

    var appFiles = [{
        dest: 'web/static/scripts/app.min.js',
        src: [
            'src/static/scripts/main.js',
            '!src/static/scripts/vendor/**/*.js',
            '!src/static/scripts/templates.js'
        ]
    }];

    var loginFiles = [{
        dest: 'web/static/scripts/login-app.min.js',
        src: [
            'src/static/scripts/login.js',
            '!src/static/scripts/vendor/**/*.js',
            '!src/static/scripts/templates.js'
        ]
    }];

    var appOptions = {
        alias: [
            'src/static/scripts/views/base-view.js:base-view',
            'src/static/scripts/models/base-model.js:base-model',
            'src/static/scripts/templates.js:templates'
        ],
        aliasMappings: [
            {
                expand: true,
                cwd: 'src/static/scripts/models',
                src: ['**/*.js'],
                dest: 'models/'
            },{
                expand: true,
                cwd: 'src/static/scripts/collections',
                src: ['**/*.js'],
                dest: 'collections/'
            },{
                expand: true,
                cwd: 'src/static/scripts/view-models',
                src: ['**/*.js'],
                dest: 'view-models/'
            },{
                expand: true,
                cwd: 'src/static/scripts/views',
                src: ['**/*.js'],
                dest: 'views/'
            },{
                expand: true,
                cwd: 'src/static/scripts/service',
                src: ['**/*.js'],
                dest: 'service/'
            },{
                expand: true,
                cwd: 'src/static/scripts/lib',
                src: ['**/*.js'],
                dest: 'lib/'
            },{
                expand: true,
                cwd: 'src/static/scripts/data',
                src: ['**/*.js'],
                dest: 'data/'
            },{
                expand: true,
                cwd: 'src/static/scripts/config',
                src: ['**/*.js'],
                dest: 'config/'
            }
        ]
    };

    var loginOptions = {
        aliasMappings: [
            {
                expand: true,
                cwd: 'src/static/scripts/service',
                src: ['**/*.js'],
                dest: 'service/'
            }
        ]
    };

    grunt.config.set('browserify', {
        options: {
            debug: true
        },

        app_dev: {
            files: appFiles,
            options: appOptions
        },

        app_prod: {
            files: appFiles,
            options: _.extend({
                preBundleCB: function (b) {
                    b.plugin(minifyify, {
                        map: 'app.min.js.map',
                        output: 'web/static/scripts/app.min.js.map'
                    });
                }
            }, appOptions)
        },

        login_dev: {
            files: loginFiles,
            options: loginOptions
        },

        login_prod: {
            files: loginFiles,
            options: _.extend({
                preBundleCB: function (b) {
                    b.plugin(minifyify, {
                        map: 'login-app.min.js.map',
                        output: 'web/static/scripts/login-app.min.js.map'
                    });
                }
            }, loginOptions)
        }
    });

    grunt.registerTask('browserify:dev', [
        'browserify:app_dev',
        'browserify:login_dev'
    ]);

    grunt.registerTask('browserify:prod', [
        'browserify:app_prod',
        'browserify:login_prod'
    ]);

    grunt.config.set('watch.browserify', {
        files: [
            'src/static/scripts/**/*.js',
            '!src/static/scripts/vendor/**/*.js'
        ],
        tasks: [
            'browserify:dev',
            'notify:build'
        ],
        options: {
            debug: false
        }
    });

    return grunt;
};
