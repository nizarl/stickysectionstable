var fs = require('fs');
var componentProperties = JSON.parse(fs.readFileSync('./src/component.properties.json'));
var constants = componentProperties[Object.keys(componentProperties)[0]];

module.exports = function () {
    var config = {
        src_dir: './src/',
        build_dir: './dist/',
        component_constants: 'component.constants.js',
        componentName: constants.componentName,
        componentVersion: constants.componentVersion,
        businessServiceApiVersion: constants.businessServiceApiVersion,
        angularModuleConstants: 'component.properties.json',
        htmlTemplatesDest: 'templates/',
        themesSource: 'css/themes/**/*.css',
        themesDest: 'themes/',
        imagesSource: 'images/*',
        imagesDest: 'images/',
        externalBundleJSName: 'external-js-libraries.js',
        cssSourceThirdParty: './css/thirdparty/*.css',
        cssDestThirdParty: 'css/thirdparty/',
        componentThirdPartyCSSName: 'ux-thirdparty.css',
        cssSourceInternal: 'css/*.css',
        cssDestInternal: 'css/internal/',
        cssDestBuild: 'css/internal/',
        componentInternalCSSName: 'ux-internal.css',
        mockDataSource: 'mock_data/*.json',
        mockDataDest: 'mock_data/',
        templateCache: {
            fileName: 'component.tpls.min.js',
            options: {
                module: 'chenExternalUIComponents',
                standAlone: true
            },
            dest: '/templatescombined/'
        }
    }
    return config;
}