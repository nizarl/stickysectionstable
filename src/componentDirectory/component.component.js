"use strict";
//register and declare component;
angular.module('chenExternalUIComponents')
    .directive("patinfoscroll", [function ($window) {
        return function (scope, element, attrs) {
            angular.element($window).bind("scroll", function () {
                if (this.pageYOffset >= 100) {
                    scope.patInfoNotScroll = false;
                    console.log('Scrolled below header.');
                } else {
                    scope.patInfoNotScroll = true;
                    console.log('Header is in view.');
                }
                scope.$apply();
            });
        };
    }]);

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

    .filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })

    .filter('customDateFormat', ['$filter', function ($filter) {
        return function (diff) {
            var date = new Date();
            date.setDate(date.getDate() + diff);
            return $filter('date')(new Date(), 'EEE MMM dd, yyyy h:mm a');
        };
    }])

    .filter('tel', function () {
        return function (tel) {
            if (!tel) {
                return '';
            }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country == 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    });



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

    //todo: get alfresco urls from PathService;
    var PatientImageAlf = 'http://alf.qa.chenmed.local:8080/alfresco/service/api/node/content/workspace/SpacesStore/';
    var patientImage = getComponentImagesUrl(componentUrl, componentName, componentVersion, "patients-visitors-icon.png");
    var hearingImpaired = getComponentImagesUrl(componentUrl, componentName, componentVersion, "hearing_impaired.PNG");
    var publicTransport = getComponentImagesUrl(componentUrl, componentName, componentVersion, "public_transport.PNG");
    var savedCorrect = getComponentImagesUrl(componentUrl, componentName, componentVersion, "saved_correct.PNG");

    patientInfoModel.showPlus = false;
    patientInfoModel.PatientImage = patientImage;
    patientInfoModel.HearingImpairedImage = hearingImpaired;
    patientInfoModel.PublicTransportImage = publicTransport;
    patientInfoModel.SavedCorrectImage = savedCorrect;
    patientInfoModel.showSideNav = true;

    patientInfoModel.title = IsJsonString(patientInfoModel.titleHeader) ? JSON.parse(patientInfoModel.titleHeader) : '';

    patientInfoModel.expandCollapsePatientInfo = function () {
        patientInfoModel.showPlus = !patientInfoModel.showPlus;
    };

    patientInfoModel.openCloseSideNav = function () {
        $mdSidenav('left').toggle();
    };

    patientInfoModel.getPrimaryTelecom = function (telecom) {
        var foundPrimaryTelecom = false;
        var primaryTelecom;
        angular.forEach(telecom, function (item) {
            if (!foundPrimaryTelecom) {
                if (item.rank == 1) {
                    foundPrimaryTelecom = true;
                    primaryTelecom = item;
                }
            }
        });
        return primaryTelecom;
    };


    patientInfoModel.$onInit = function () {
        //This lifecycle hook will be executed when all 
        //controllers on an element have been constructed and after their bindings are initialized
        fetchPatientInfo(restClientService, pathInfo, patientService, EventService, createFailedEvent).then(function (resp) {
            var eventHandler = validateResponseData(resp.data);
            patientInfoModel.patientData = resp.data;
            var patientAge = moment(patientInfoModel.patientData.birthDate, "MM/DD/YYYY");
            patientInfoModel.patientData.address = resp.data.address.length > 0 ? _.find(resp.data.address, function (n) {
                return n.use == "HOME";
            }) : {};

            patientInfoModel.patientData.telecom = resp.data.telecom.length > 0 ? resp.data.telecom : {};
            patientInfoModel.patientData.patientCareProvider = _(resp.data.careProvider).chain().
            pluck('name').
            flatten().
            findWhere({
                use: "OFFICIAL"
            }).
            value();
            patientInfoModel.patientData.patientName = _.find(resp.data.name, function (n) {
                return n.use == "OFFICIAL";
            });

            patientInfoModel.patientData.age = moment().diff(patientAge, 'years');

        });
    };
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

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
     * @param: Required: {object} config (Use if need to extend or override AngularJs $http defaults.)
     * @param: Optional: (function) errorCallBack
     * @return Promise
     * 
     */
    return restClientService.getData(config, errorCallBack);
}

function getComponentImagesUrl(compUrl, compName, compVer, imageName) {
    return compUrl + "components/" + compName + '/' + compName + '-' + compVer + '/images/' + imageName;
}

function validateResponseData(data) {
    //stub:
    //test data response: return true, or false
    if (!(data.mrNumber && data.name[0].family && data.name[0].given)) {

    } else {
        //errorCallback();
    }
}