'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.config.set('watch.grunt', {
        files: [
            'Gruntfile.js',
            'grunt/*.js',
        ],
        options: {
            reload: true
        }
    });

};
