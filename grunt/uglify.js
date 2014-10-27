'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.config.set('watch.uglify', {
        files: [
            'src/static/scripts/vendor/**/*.js',
            '!**/*.min.js'
        ],
        tasks: [
            'uglify:dev'
        ]
    });

    var files = {
        'web/static/scripts/vendor.min.js': [
            'src/static/scripts/vendor/forio/contour.js',
            'src/static/scripts/vendor/forio/contour-advanced-components.js',
            'src/static/scripts/vendor/**/*.js',
            '!src/static/scripts/vendor/development/**/*.js',
            '!**/*.min.*'
        ]
    };

    grunt.config.set('uglify', {
        options: {
            sourceMap: true,
            sourceMapIncludeSources: true
        },

        dev: {
            files: files,
            options: {
                mangle: false,
                beautify: true
            }
        },

        prod: {
            files: files
        }
    });

    return grunt;
};
