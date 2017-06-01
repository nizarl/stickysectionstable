<a name="0.0.2"></a>
# 0.0.2 (2017-05-27)

## Breaking Changes:
- **placeHolder:** 

## Bug Fixes:
- **placeHolder:** 
  

## New Features:
**1. Attributed binding:** add `titleHeader` component binding

Usage: (From caller/consumer (i.e Aggregator))
```js
//set title:
model.title = {
		titleFull: 'Carepro',
		firstSegment: 'Care',
		secondSegment: 'pro'	
	}
//use element with attribute:
<patientinfo-component title-header={{model.title}}></patientinfo-component>
```

**2. Event System Usage:** 

Create Event:

EventService.add('string-event-name', {"detail": {"reason": ""}})

Example:

```js
var createFailedEvent = EventService.add('patientinfo-failed', {
        "detail": {
            "reason": "CTECH CUSTOM EVENT: PATIENT INFO COMPONENT FETCH DATA FALURE"
        }
    })
```

Dispatch Event:

EventService.dispatch({EventObject})

Example:
```js
fetchPatientInfo(restClientService, pathInfo, patientService, EventService, createFailedEvent).then(function (resp) {...}


function fetchPatientInfo(restClientService, pathInfo, patientService, EventService, failEvent) {

    var apiUrl = pathInfo.apiUrl;
    var patientId = patientService.getPatientId();
    var url = apiUrl + "patientInfo/" + patientId;
    var config = {
        url: url
    };
    var errorCallBack = function () {
        EventService.dispatch(failEvent)
    };

    /**
     * 
     * For local development: Default business service points to INT in case you don't have JRE running locally.
     * For local JRE (Business service) replace return statement with local path.
     * Example: return "http://localhost:8080/.../patientInfo/patientId";
     * 
     * getData(): REST call for component R/O data.
     * Signature: getData({object} config, (function) errorCallBack: function(){})
     * 
     * @param: Required: {object} config (Use if need to extend or override AngularJS $http defaults.)
     * @param: Optional: (function) errorCallBack
     * @return Promise
     * 
     */
    return restClientService.getData(config, errorCallBack);
}

```
## Usage Examples:

```js
angular.module('chenExternalUIComponents')
    .component("patientinfoComponent", {
        bindings: {
            titleHeader: '@'
        },
        template: ['$templateCache', function ($templateCache) {
            return $templateCache.get('patientinfo.component.html');
        }],
        controllerAs: "patientInfoModel",
        controller: ['EventService', 'RestClientService', 'PathService', 'PatientService', '$timeout', '$mdSidenav', 'patientInfoConstants', patientInfoCtrl]
    })

//Example Usage:

function patientInfoCtrl(EventService, RestClientService, PathService, PatientService, $timeout, $mdSidenav, patientInfoConstants) {

    var componentName = patientInfoConstants.componentName;
    var componentVersion = patientInfoConstants.componentVersion;
    var componentApiVersion = patientInfoConstants.businessServiceApiVersion;
    var restClientService = RestClientService;
    var pathService = PathService;
    var pathInfo = pathService.getPathInfo();
    var componentUrl = pathInfo.componentUrl;
    var patientService = PatientService;
    var patientInfoModel = this;
    var createFailedEvent = EventService.add('patientinfo-failed', {
        "detail": {
            "reason": "CTECH CUSTOM EVENT: PATIENT INFO COMPONENT FETCH DATA FALURE"
        }
    })
    ...
}
```


