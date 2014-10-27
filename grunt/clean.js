'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.config.set('clean', {
        build: ['web/']
    });
};