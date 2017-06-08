//debug: sudo node-debug $(which gulp) build 

var gulp = require('gulp');
var ignore = require('gulp-ignore');
var exec = require('child_process').exec;
var compass = require('gulp-compass');
var clean = require('gulp-clean');
var concat = require('gulp-concat'); //bundle
var uglify = require('gulp-uglify'); //minify for JS
var autoprefixer = require('gulp-autoprefixer');
var streamqueue = require('streamqueue');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var htmlmin = require('gulp-htmlmin');
var ifElse = require('gulp-if-else');
var Server = require('karma').Server;
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');
var config = require('./gulp/gulp.config.js')();
var ngConstant = require('gulp-ng-constant-fork');
var requireDir = require('require-dir');
var cleanCSS = require('gulp-clean-css'); //minify for CSS
var helper = require('./gulp/tasks/helpers.js')();

requireDir('./gulp/tasks', {
    recurse: true
});

function onError(err) {
    gutil.beep();
    console.log(err.toString())
    this.emit('end')
};

gulp.task('clean-build-dir', function () {
    return gulp.src(config.build_dir, {
            read: false
        })
        .pipe(clean());
});

gulp.task('build-component-js', function () {
    var fileName = helper.getNewFileName(".js", config);
    var fileNameMin = helper.getNewFileName(".min.js", config);
    var stream = streamqueue({
        objectMode: true
    });
    stream.queue(helper.createModuleConstants(config)),
        stream.queue(helper.createComponentTemplateCache(config)),
        stream.queue(helper.buildComponentJs(config));
    return stream.done()
        .pipe(plumber(({
            errorHandler: onError
        })))
        .pipe(concat(fileName))
        .pipe(helper.copyFile(config))
        .pipe(concat(fileNameMin))
        .pipe(uglify())
        .pipe(helper.copyFile(config));
});

gulp.task('build-component-html', function () {
    var originalFileName = helper.getSourceFileName(".html", config)
    var newFileName = helper.getNewFileName(".html", config);
    return gulp.src([originalFileName])
        .pipe(helper.renameFile(newFileName))
        .pipe(helper.copyFile(config));
});


gulp.task('copy-images', function () {
    return gulp.src([config.src_dir + config.componentName + '/images/**'])
        .pipe(gulp.dest(config.build_dir + 'components/' + config.componentName + "/" + config.componentName + "-" + config.componentVersion + '/images'));
});

gulp.task('compass', function () {
    return gulp.src(config.src_dir + '/scss/**/*.scss')
        .pipe(plumber(({
            errorHandler: onError
        })))
        .pipe(compass({
            css: config.src_dir + config.componentName + '/',
            sass: config.src_dir + config.componentName + '/',
            config_file: './config.rb',
        }))
});

gulp.task('copy-component-css', function () {
    var originalFileName = config.src_dir + config.componentName + '/' + config.componentName + '.component' + '.css';
    var newFileName = helper.getNewFileName(".css", config);
    var newFileNameMin = helper.getNewFileName(".min.css", config);
    return gulp.src([originalFileName])
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(helper.renameFile(newFileName))
        .pipe(helper.copyFile(config))
        .pipe(cleanCSS())
        .pipe(helper.renameFile(newFileNameMin))
        .pipe(helper.copyFile(config));
});
gulp.task('deleteSourceCss', function () {
    return gulp.src(config.src_dir + config.componentName + '/' + '*.css', {
            read: false
        })
        .pipe(clean());
})

gulp.task('sequence-styles', function (callback) {
    return runSequence('compass', 'copy-component-css', 'deleteSourceCss', callback)
})

gulp.task('start-local-server', function (cb) {
    gutil.log(gutil.colors.green(config.componentName + " web server started at http://localhost:3000 --cors is enabled"));
    //--no-cache
    exec(' ws -p 3000 -d ./dist --compress', function (err, stdout, stderr) {});
});

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('build', function (callback) {
    return runSequence('clean-build-dir', 'build-component-js', 'build-component-html', 'copy-images', 'sequence-styles', callback);
});

gulp.task('default', function (callback) {
    return runSequence('start-watchers', 'start-local-server', callback);
});