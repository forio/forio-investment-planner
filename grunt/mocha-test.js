'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.config.set('mochaTest', {
        test: {
            options: {
                reporter: 'spec'
            },
            src: [
                'test/unit/**/*.js'
            ]
        }
    });

    return grunt;
};