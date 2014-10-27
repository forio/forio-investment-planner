'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.config.set('watch.less', {
        files: [
            'src/static/styles/**/*.less'
        ],
        tasks: [
            'less:dev', 'notify:build'
        ]
    });

    var files = [{
        src: 'src/static/styles/style.less',
        dest: 'web/static/styles/style.css'
    }];

    grunt.config.set('less', {
        dev: {
            files: files
        },

        prod: {
            files: files,
            options: {
                cleancss: true
            }
        }
    });

    return grunt;
};
