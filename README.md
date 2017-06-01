# Component project developer instructions:

##   __1. Complete software prerequisites.__

Use Confluence link below to open document - *__Frontend Developer Workstation Setup Guide.__*

https://confluence.chenmed.com/display/MAINT/Developer+Environment+Setup+-+Frontend

__** All commands below are run from root directory of project unless specified otherwise.__

## __2. Install project dependencies__
```
npm install
```
## __3. How to Branch and Version Component__
Branch from develop and use updated version number as follows:

Example branch name:

__feature/componentname-1.2.3__

1.  Breaking changes.
2.  Minor change. New feature and/or enchancements. No breaking changes.
3.  Bug fix. No breaking changes.

Git Tags:
Use git tag in develop branch once released component is merged back into develop branch.

## __4. Prepare component for build__

1. Create new branch from develop branch.

2. Open component.properties.json and update constants object as below.

    Note: component.properties.json file: (These values are used as AngularJS constants at runtime.)
    
    Example: 

    ```js
    //rename object key (one word camelCase) and update version number.
    {
        "patientInfoConstants": {  
            "componentName": "patientinfo", 
            "componentVersion": "1.2.3",
            "businessServiceApiVersion": "2"
        }
    }
    ```
3. Prepare source directory and files: 
    {Rename generic directory and files based on component template project}

    * The gulp command below is only used for first time component source directory and source file renames.
    
    * Only necessary if the following exact generic directory name exist:                 *__/src/app/componentDirectory__*

    * If you don't see the directory above you can skip this step.

```js
gulp prepare-source-files
```

## __5. Build Component Project__

```js
gulp build
```
## __6. Start local web server and file watchers__
```js
gulp
```
## __7. Unit Tests__

Note: Local dev server is not used and does not need to run for Unit test. Unit test use file(s) in __/dist__ directory.

1. Make sure the following two files located in /unitTests/deps are using the same version of shared library that aggregator uses. These shared library file are loaded on CDN. Copy locally as needed.

    a. uic-core.js

    b. uic-thirdparty.js


```js
gulp build
gulp test
```

