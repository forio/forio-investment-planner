'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-notify');

    grunt.config.set('notify',{
        build: {
            options: {
                title: 'Build complete',
                message: '<%= package %> build finished successfully.'
            }
        }
    });
};