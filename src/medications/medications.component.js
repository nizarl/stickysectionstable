"use strict";

angular.module('chenExternalUIComponents')

    .component("medsComponent", {
        template: ['$templateCache', function ($templateCache) {
            return $templateCache.get('medications.component.html');
        }],
        bindings: {
            showMedsToggle: '<'
        },
        controllerAs: "medModel",
        controller: ['EventService', 'RestClientService', 'PathService', 'PatientService', '$timeout', 'medicationsConstants', medicationsCtrl]
    });

function medicationsCtrl(EventService, RestClientService, PathService, PatientService, $timeout, medicationsConstants) {
    var componentName = medicationsConstants.componentName;
    var componentVersion = medicationsConstants.componentVersion;
    var restClientService = RestClientService;
    var pathService = PathService;
    var pathInfo = PathService.getPathInfo();
    var componentUrl = pathInfo.componentUrl;
    var patientService = PatientService;
    var medModel = this;
    var sortPropDefault = 'hccScore';
    medModel.order = 'asc';
    medModel.showSort = true;
    medModel.showPlus = false;
    medModel.patientMeds = [];
    medModel.setExpandMed = function () {
        medModel.showPlus = !medModel.showPlus;
    };

    medModel.$onInit = function () {
        fetchPatientMeds(RestClientService, pathInfo, patientService).then(function (resp) {
            if (resp.data.length > 0) {
                var medVM = buildActiveMeds(resp.data);
                medModel.patientMeds = medVM;
                medModel.displayedCollection = medVM;
            } else {
                medModel.patientMeds = [];
                var errInfo = {
                    componentName: componentName,
                    errorType: 1
                }
                showErrorMessage(errInfo)
            }
        });
    };
    medModel.closeRefillOverlay = function () {
        medModel.showMedsRefill = false;
    };
    medModel.showRefillOverLay = function () {
        medModel.showMedsRefill = true;
    };

    medModel.checkAll = function () {
        medModel.selectedMeds = !medModel.selectedMeds;
        medModel.patientMeds.forEach(function (med) {
            med.selected = medModel.selectedMeds;
        });
    };

    medModel.getters = {
        medicationName: function (row) {
            return row.medicationName;
        },
        medicationStartDate: function (row) {
            return moment(row.medicationStartDate, "MM-DD-YYYY").toDate();
        },
        prescriber: function (row) {
            return row.prescriber.display;
        },
        refillQty: function (row) {

            return row.refillQty;
        },
        daysSupplyLeft: function (row) {
            return parseInt(row.daysSupplyLeft);
        }
    };

    function fetchPatientMeds(RestClientService, pathService, patientService) {

        var apiUrl = pathInfo.apiUrl;
        var patientId = patientService.getPatientId();
        var url = apiUrl + "medications/" + patientId;
        var config = {
            url: url
        };
        var errorCallBack = function () {
            var errInfo = {
                componentName: componentName,
                errorType: 2
            }
            showErrorMessage(errInfo)
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

    function buildActiveMeds(array) {
        array.forEach(function (med) {
            med.selected = false;
        });
        return array;
    }

    function showErrorMessage(errorObj) {
        medModel.showErrorMessage = true;
        medModel.errorMessageData = {
            componentName: errorObj.componentName,
            errorType: errorObj.errorType
        }
    }
}