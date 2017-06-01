var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
module.exports = function () {

    function getDestPath(config) {
        return config.build_dir + "components/" + config.componentName + "/" + config.componentName + "-" + config.componentVersion;
    }

    function createModuleConstants(config) {
        return gulp.src(config.src_dir + config.angularModuleConstants)
            .pipe(gulpNgConfig('chenExternalUIComponents', {
                createModule: false
            }))
            .pipe(rename(config.component_constants))
    }

    function renameFile(newFileName) {
        var stream = rename(newFileName);
        return stream;
    }

    function copyFile(config) {
        var stream = gulp.dest(this.getDestPath(config));
        return stream;
    }

    function getSourceFileName(extension, config) {
        return config.src_dir + config.componentName + "/" + config.componentName + ".component" + extension
    }

    function getNewFileName(extension, config) {
        return config.componentName + ".component-" + config.componentVersion + extension
    }

    function createComponentTemplateCache(config) {
        return gulp
            .src(config.src_dir + config.componentName + '/*.html')
            .pipe(templateCache(
                config.templateCache.fileName,
                config.templateCache.options
            ))
    }

    function buildComponentJs(config) {
        return gulp.src(['!' + config.src_dir + config.componentName + '/*.spec.js', config.src_dir + config.componentName + '/*.js'])
    }
    

    return {
        getDestPath: getDestPath,
        createModuleConstants: createModuleConstants,
        renameFile: renameFile,
        copyFile: copyFile,
        getSourceFileName: getSourceFileName,
        getNewFileName: getNewFileName,
        createComponentTemplateCache: createComponentTemplateCache,
        buildComponentJs: buildComponentJs

    }
};