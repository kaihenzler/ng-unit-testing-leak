'use strict';

(function () {

    /**
     * This example shows how to structure a unit test using the 'this'-keyword if jasmine as it's documented here:
     * @link http://jasmine.github.io/2.0/introduction.html#section-The_<code>this</code>_keyword
     *
     * unfortunately the official angular docs encourage developers to write tests that leak memory because it is
     * not mentioned clearly that we have to take care of test cleanup ourselves.
     *
     * a possible solution of the cleanup is seen in 'heavyLoad-directive.effective.spec.js' file where the developer
     * has to null every variable declared outside of an 'it'-block
     *
     * this solution illustrates that you can use the 'this' keyword that is handled by jasmine.
     * the jasmine docs say:
     *      "Another way to share variables between a beforeEach, it, and afterEach is through the this keyword.
     *      Each spec’s beforeEach/it/afterEach has the this as the same empty object that is set back to empty
     *      for the next spec’s beforeEach/it/afterEach."
     *
     * in summary the docs say the same thing we want to accomplish. We want a clean environment setup before each 'it'
     * and we want jasmine to take care of the proper cleanup of the shared variables. By putting all our variables
     * onto the 'this' we let jasmine do its job and we can focus on writing unit tests that test our own code.
     */

    function testDefinition() {

        //declare the module you want to instantiate
        beforeEach(module('app'));

        //you don't have to use underscore syntax like '_MyService_' because we assign the injected components
        //onto the 'this' of jasmine
        beforeEach(inject(function ($rootScope, $compile, heavyLoad) {
            //assign all the injectables to 'this' for all the other 'beforeEach', 'afterEach' and 'it'-blocks
            //share the same 'this'
            this.$rootScope = $rootScope;
            this.$compile = $compile;
            this.heavyLoad = heavyLoad;
            this.$scope = $rootScope.$new();

            //create spy's and execute the original function
            spyOn(this.heavyLoad, 'getHeavyString').and.callThrough();
            spyOn(this.heavyLoad, 'getHeavyObject').and.callThrough();
            spyOn(this.heavyLoad, 'getHeavyList').and.callThrough();
        }));

        //declare your test helpers in a beforeEach-block so you have access to 'this',
        //give the function a name like testHelpers because it's easier for your colleagues to find the test-setup code
        //it is best you don't use 'var' anywhere but in 'it'-blocks so you don't have to take care of proper cleanup
        beforeEach(function testHelpers() {
            this.compileDirective = function (template) {
                this.element = this.$compile(template)(this.$scope);
                this.directiveScope = this.element.isolateScope();
            };
        });

        // NOTE: cleanup
        afterEach(function () {
            // NOTE: prevents DOM elements leak
            this.element.remove();
        });

        it('should compile correctly', function () {
            //'var' is allowed in an 'it'-block and doesn't have to be null-ed
            var givenTemplate = '<div heavy-load></div>';

            //prepare the directive (this function is defined on 'this' in beforeEach)
            this.compileDirective(givenTemplate);

            //go through your assertions. here we have access to the 'this'
            expect(this.directiveScope.title).toBeDefined();
            expect(this.directiveScope.items).toBeDefined();
            expect(this.heavyLoad.getHeavyString).toHaveBeenCalled();
            expect(this.heavyLoad.getHeavyList).toHaveBeenCalled();
        });
    }

    // define multiple suits with the same definition just for showcase
    for (var i = 0; i < 3000; i += 1) {
        describe('heavyLoad effective directive #' + i, testDefinition);
    }

})();