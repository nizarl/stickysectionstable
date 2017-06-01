//Note: this file needs to be updated to match the shared version being used.

angular.module("chenExternalUIComponents", ["ngSanitize","environment","ngMaterial","smart-table","ngCookies"])

.constant("businessServiceBaseUrls", {
	"domains": {
		"localhost": [
			"localhost",
			"127.0.0.1"
		],
		"int": [
			"patientsummary-int.chenmed.local",
			"carepro-int.chenmed.local"
		],
		"qa": [
			"patientsummary-qa.chenmed.local"
		],
		"production": [
			"patientsummary.chenmed.com"
		]
	},
	"localhost": {
		"patSumAPI": "https://patientsummary-app-int.chenmed.local/PatientSummaryService/patientSummary/",
		"careProAPI": "https://carepro-app-int.chenmed.local/careproservice/carepro/",
		"myNotesAPI": "http://localhost:28556/",
		"uxComponents": "http://localhost:3000/"
	},
	"int": {
		"patSumAPI": "https://patientsummary-app-int.chenmed.local/PatientSummaryService/patientSummary/",
		"uxComponents": "https://ux-components-int.chenmed.local/"
	},
	"qa": {
		"patSumAPI": "https://patientsummary-app-qa.chenmed.local/PatientSummaryService/patientSummary/",
		"uxComponents": "https://ux-components-qa.chenmed.local/"
	},
	"production": {
		"myNotesAPI": "https://mynotes-api.chenmed.com/",
		"uxComponents": "https://ux-components.chenmed.local/"
	}
})

.constant("deps", [
	"ngSanitize",
	"environment",
	"ngMaterial",
	"smart-table",
	"ngCookies"
])

;
(function () {
    var components = angular.module('chenExternalUIComponents');
    components.config(['envServiceProvider', 'businessServiceBaseUrls', function (envServiceProvider, businessServiceBaseUrls) {
        envServiceProvider.config({
            domains: businessServiceBaseUrls.domains,
            vars: {
                localhost: businessServiceBaseUrls.localhost,
                int: businessServiceBaseUrls.int,
                qa: businessServiceBaseUrls.qa,
                production: businessServiceBaseUrls.production
            }
        });
        // run the environment check before controllers and services are built 
        envServiceProvider.check();
    }]);
})();

(function () {
angular.module('chenExternalUIComponents').service('EventService', [EventService]);

function EventService() {
    'use strict';
    var evt = '';
    this.addEvent = function (eventName, eventData) {
        return evt = new CustomEvent(eventName, eventData);
    }
    this.subscribe = function (eventName, callback) {
        window.addEventListener(eventName,
            function (e) {
                if (typeof callback === "function") {
                    callback(e);
                }
            }
        );
    }
    this.unsubscribe = function (eventName, fn) {
        window.removeEventListener(eventName, fn);
    }

    this.dispatch = function (eventObject) {
        window.dispatchEvent(eventObject);
    };

    return {
        add: this.addEvent,
        subscribe: this.subscribe,
        unsubscribe: this.unsubscribe,
        dispatch: this.dispatch
    }
}
})();
(function () {
angular.module('chenExternalUIComponents').service('RestClientService', ['$http', RestClientService]);
function RestClientService($http) {
    'use strict';
    this.getData = function (config, errorCB) {
        var cfg = config;
        cfg.method = "GET"
        return $http(cfg).success(function (data) {
            return data;
        }).error(function (data, status, headers, config) {
            if (typeof errorCB === 'function') {
                errorCB();
            }
            console.error(status);
            console.error(data);
            console.error(headers);
            console.error(config);
            var error = "Cound not get data.";
        });
    };
    this.postData = function (url, requestBody, config) {
        return $http({
            url: url,
            method: "POST",
            data: requestBody
        }).success(function (data) {
            return data;
        }).error(function (data, status, headers, config) {
            console.error(status);
            console.error(data);
            console.error(headers);
            console.error(config);
            var error = 'Error, Not Updated';
        });
    };

    return {
        getData: this.getData,
        postData: this.postData
    }
}
})();
(function () {
var info_message_factory = angular.module('chenExternalUIComponents');
info_message_factory.factory('infoMessageFactory', ['$rootScope', function ($rootScope) {
    'use strict';
    var self = this;

    self.warningMessage = 'There are no records found for this patient.';
    self.getWarningMessage = function(recordType){
        return recordType ? 'There are no records (' + recordType + ') found for this patient.' : self.warningMessage;
    }
    self.errorMessage = "The System is experiencing difficulties loading patient's record, please try again later or contact support.";

    return self;
}]);

})();


(function () {
angular.module('chenExternalUIComponents').service('PathService', ['businessServiceBaseUrls', 'envService', '$cookieStore', '$location', PathService]);

function PathService(businessServiceBaseUrls, envService, $cookieStore, $location) {
    'use strict';
    //v1: This function will be deprecated once REST endpoints are updated to application-independent urls;
    var v1method = function name() {
        var urls = businessServiceBaseUrls;
        var environment = envService.get();
        var appName = $cookieStore.get('appName');
        var appVersion = $cookieStore.get('appVersion');
        var getEnvObj = v1ApiInfo(environment, urls, appName, appVersion)
        return getEnvObj;


    }
    var v1ApiInfo = function (env, urls, appName, appVersion) {
        var aggregator = {};
        var searchStr = appName;
        var aggregatorFound = false;


        _.each(urls[env], function (value, key) {
            var match = value.toLowerCase().indexOf(searchStr) > -1
            if (match) {
                aggregatorFound = true;
                aggregator.apiKey = key;
                aggregator.apiVersion = appVersion;
                aggregator.apiUrl = value;
                aggregator.componentUrl = urls[env].uxComponents;
            }
        })

        if (!aggregatorFound) {
            aggregator.api = "not found - check aggregator cookie appName",
                aggregator.url = "not found - check aggregator cookie appName"
        }
        return aggregator;
    } 
   
   //v2: Endpoints fixed pattern (check environment and send url based on environment)
    var getUrl = function name(env) {
        return {
            apiKey:"patSumAPI",
            apiUrl: "https://patientsummary-app-int.chenmed.local/PatientSummaryService/patientSummary/",
            apiVersion :"0.1.1",
            componentUrl : "http://localhost:3000/"
        }
        // apiVersion = appVersion;
        // apiUrl = value;
        // componentUrl = urls[env].uxComponents;
        // var data = {
        //     apiKey:"patSumAPI",
        //     apiUrl: "https://patientsummary-app-int.chenmed.local/PatientSummaryService/patientSummary/",
        //     apiVersion :"0.1.1",
        //     componentUrl : "http://localhost:3000/"
        // }

    }

    var getEnv = function ($location) {
        var location = $location;
        var port = $location.port()

        if (port == 3000 || 9000) {
            return {
                environment: 'localhost'
            }
        }

        // var envOptions = ['localhost', 'int', 'qa', 'prod']
        //return 

    }
    var urlBuilder = function () {
        var env = getEnv($location);
        var pathValues = getUrl(env);
        return pathValues

    }

   //------------------------

    this.getPathInfo = function (key) {
        if (arguments.length === 0) {
            return v1method()
        } else if (typeof key === 'object') {
            return urlBuilder(key);
        } else {
            // unsupported arguments passed
        }
    }

    return {
        getPathInfo: this.getPathInfo
    }
}
})();
(function () {
angular.module('chenExternalUIComponents').service('PatientService', ['$cookieStore', PatientService]);

function PatientService($cookieStore) {
   'use strict';
    this.getPatientId = function () {
        var patientId = $cookieStore.get('patientId');
        return patientId;
    }

    return {
        getPatientId: this.getPatientId
    }
}
})();
//stub only
(function () {
angular.module('chenExternalUIComponents').service('UserService', ['$cookieStore', UserService]);

function UserService($cookieStore) {
   'use strict';
    this.getUserId = function () {
        //will use JWT in cookie once ready
        var userId = 'jwt123'
        return userId;
    }

    return {
        getUserId: this.getUserId
    }
}
})();