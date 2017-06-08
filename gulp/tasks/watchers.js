var gulp = require('gulp');
var config = require('../gulp.config.js')();
var fs = require('fs');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

function watch() {
    const watchers = [{
            name: 'HTML',
            path: [config.src_dir + config.componentName + '/*.html'],
            tasks: ['build']
        },
        {
            name: 'JS',
            path: [config.src_dir + config.componentName + '/*.js'],
            tasks: ['build']
        },
        {
            name: 'SASS',
            path: [config.src_dir + config.componentName + '/' + '/*.scss'],
            tasks: ['sequence-styles']
        },
    ];

    watchers.forEach(watcher => {
        gutil.log(gutil.colors.green("watching: " + watcher.name));
        gulp.watch(watcher.path, watcher.tasks);
    });
}

gulp.task('start-watchers', function () {
    watch();
});