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
                   
                   //temp Mock more than 5 Meds.  Enable vertical scroll.
                   // var mockMeds = medModel.patientMeds.concat(medModel.patientMeds);
                    medModel.patientMeds = medVM;

                    medModel.displayedCollection = medVM;
                } else {
                    medModel.patientMeds = [];
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
        var errorCallBack = function () {};

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
        //placeholder. will use more functions to add history
        array.forEach(function (med) {
            med.selected = false;
            //  med.prescriber.display = med.prescriber.display ? med.prescriber.display: "Data no available"; 
        });
        return array;
    }
}