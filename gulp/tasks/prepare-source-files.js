var gulp = require('gulp');
var rename = require("gulp-rename");
var clean = require('gulp-clean');
var fs = require('fs');
var dirPath = 'src/';
var templateComponentDirName = 'componentDirectory';
var componentProperties = JSON.parse(fs.readFileSync('./src/component.properties.json'));
var constants = componentProperties[Object.keys(componentProperties)[0]];
var componentName = constants.componentName;
var gutil = require('gulp-util');

var filesToRename = {
    html: {
        oldName: 'component.component.html',
        newName: componentName + '.component.html'
    },
    js: {
        oldName: 'component.component.js',
        newName: componentName + '.component.js'
    },
    scss: {
        oldName: 'component.component.scss',
        newName: componentName + '.component.scss'
    },
    mock: {
        oldName: 'component.mockdata.json',
        newName: componentName + '.mockdata.json'
    }
}
gulp.task('prepare-source-files', function () {
    renameSrcDirFiles(filesToRename, renameFiles)
})

function renameSrcDirFiles(files, renFiles) {
    if (fs.existsSync(dirPath + componentName)) {
        return gutil.log(gutil.colors.red(componentName + " directory already exists"));
    }
    return fs.rename(dirPath + templateComponentDirName, dirPath + componentName, function (err) {
        if (err) {
            throw err;
        }
        if (typeof renFiles === 'function') {
            renFiles(files);
        }

    });
}

function renameFiles(files) {
    Object.keys(files).forEach(function (key) {
        var file = files[key];
        createNewFile(file.newName, file.oldName, removeOldFile)
    });
}

function createNewFile(newFile, oldFile, deleteOldFile) {
    gulp.src(dirPath + componentName + '/' + oldFile)
        .pipe(rename(newFile))
        .pipe(gulp.dest(dirPath + componentName + '/'));
    if (typeof deleteOldFile === 'function') {
        deleteOldFile(oldFile);
    }
}

function removeOldFile(oldFile) {
    return gulp.src(dirPath + componentName + '/' + oldFile, {
            read: false
        })
        .pipe(clean());
}