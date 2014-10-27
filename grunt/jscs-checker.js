'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-jscs-checker');

    grunt.config.set('jscs', {
        options: {
            config: '.jscs.json'
        },
        all: {
            files: {
                src: [
                    'Gruntfile.js',
                    'grunt/*.js',
                    'src/scripts/**/*.js'
                ]
            }
        }
    });

    return grunt;
};