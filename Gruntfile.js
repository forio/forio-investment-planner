'use strict';

module.exports = function (grunt) {

    require('time-grunt')(grunt);

    grunt.file.expand('grunt/*.js').forEach(function (task) {
        require('./' + task)(grunt);
    });

    grunt.registerTask('default', [
        'clean',
        'handlebars',
        'less:dev',
        'uglify:dev',
        'browserify:dev',
        'copy:dev',
        'concurrent',
        'notify:build',
    ]);

    grunt.registerTask('production', [
        'clean',
        'handlebars',
        'less:prod',
        'uglify:prod',
        'browserify:prod',
        'copy:prod'
    ]);
};
