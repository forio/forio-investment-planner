'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');

    var htmlFiles = [
        {
            expand: true,
            cwd: 'src/static/',
            src: ['*.html'],
            dest: 'web/static'
        }
    ];

    grunt.config.set('copy', {
        model: {
            files: [
                {
                    expand: true,
                    cwd: 'src/model/',
                    src: ['**'],
                    dest: 'web/model/'
                }
            ]
        },

        static: {
            files: [
                {
                    expand: true,
                    cwd: 'src/static/',
                    src: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.eot', '**/*.ttf', '**/*.woff', '**/*.json', '**/*.pdf', '**/*.pptx', '**/*.swf'],
                    dest: 'web/static'
                }
            ]
        },

        js_dev: {
            files: [
                {
                    expand: true,
                    cwd: 'src/static/',
                    src: ['**/development/**/*.js', '**/*.min.js', '**/*.map'],
                    dest: 'web/static'
                }
            ]
        },

        js_prod: {
            files: [
                {
                    expand: true,
                    cwd: 'src/static/',
                    src: ['**/*.min.js', '**/*.map'],
                    dest: 'web/static'
                }
            ]
        },

        html_dev: {
            files: htmlFiles,
            options: {
                process: function (content, srcpath) {
                    return replaceMarks('DEVELOPMENT', 'PRODUCTION', content);
                }
            }
        },

        html_prod: {
            files: htmlFiles,
            options: {
                process: function (content, srcpath) {
                    return replaceMarks('PRODUCTION', 'DEVELOPMENT', content);
                }
            }
        }
    });

    grunt.registerTask('copy:dev', [
        'copy:model',
        'copy:static',
        'copy:js_dev',
        'copy:html_dev'
    ]);

    grunt.registerTask('copy:prod', [
        'copy:model',
        'copy:static',
        'copy:js_prod',
        'copy:html_prod'
    ]);

    grunt.config.set('watch.copy-model', {
        files: ['src/model/**/*.*'],
        tasks: ['copy:model', 'notify:build']
    });

    grunt.config.set('watch.copy-static', {
        files: ['src/static/img/**/*.*', 'src/static/**/*.json', 'src/static/**/*.swf'],
        tasks: ['copy:static', 'notify:build']
    });

    grunt.config.set('watch.copy-js', {
        files: ['src/static/**/development/**/*.js', 'src/static/**/*.min.js'],
        tasks: ['copy:js_dev', 'notify:build']
    });

    grunt.config.set('watch.copy-html', {
        files: ['src/static/**/*.html'],
        tasks: ['copy:html_dev', 'notify:build']
    });


    function replaceMarks(includeMark, excludeMark, content) {
        content = content.replace(markRegExp(includeMark), '$1');
        content = content.replace(markRegExp(excludeMark), '');

        return content.replace(/%TIMESTAMP%/g, Date.now());


        function markRegExp(mark) {
            return new RegExp('%' + mark + '%([^]*)%/' + mark + '%', 'g');
        }
    }


    return grunt;
};
