describe('component: Patient Info', function () {
    //ARRANGE
    var $componentController;
    //Pass the actual bindings to the component
    var bindings = {
        obj: {
            name: 'patinfo'
        }
    };
    beforeEach(module('chenExternalUIComponents'));

    beforeEach(module(function ($provide) {
        $provide.value('PathService', {
            getPathInfo: function () {
                return {
                    componentUrl: 'http://localhost:3000/',
                }
            }
        });
    }));
    beforeEach(inject(function (_$componentController_, _$rootScope_, _$compile_) {
        $componentController = _$componentController_;
        scope = _$rootScope_.$new();
        $compile = _$compile_;
    }));
    //Mock: Rest Client Call.
    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET')
            .respond();
    }));

    it('should render template and find element by ID', function () {
        //ACT
        var element = $compile("<patientinfo-component></patientinfo-component")(scope);
        element = $compile(element)(scope);
        scope.$digest();
        var items = element.find('#pat-info-container');
        //ASSERT
        expect(items.length).toBe(1);
    });

    it('should create instance of component and get/set component attribute binding', function () {
        //ACT
        var ctrl = $componentController('patientinfoComponent', null, bindings);
        //ASSERT
        expect(ctrl.obj.name).toBe('patinfo');
    });
});