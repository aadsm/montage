var Montage = require("montage").Montage,
    TestPageLoader = require("montage-testing/testpageloader").TestPageLoader;

TestPageLoader.queueTest("alternation/alternation", function(testPage) {
    describe("ui/repetition-spec", function() {
        var eventManager,
            application,
            delegate;

        var querySelector = function(s) {
            return testPage.querySelector(s);
        };

        beforeEach(function () {
            application = testPage.window.document.application;
            eventManager = application.eventManager;
            delegate = application.delegate;
        });

        describe("switchPath property", function() {
            it("should only draw DOM elements that match switchPath", function() {
                var element = testPage.querySelector(".alternationSwitchPath");
                expect(element).toBeDefined();
                expect(element.textContent).toBe("PASS");
            });

            it("should iterate through content", function() {
                var component = testPage.test.templateObjects.switchPathIteration.templateObjects.alternation;

                component.content = [
                    {"name": "John", "isAdmin": true},
                    {"name": "Mary", "isAdmin": false}
                ];

                testPage.waitForComponentDraw(component);
                runs(function() {
                    var admin = testPage.querySelector("#switch-path-admin");
                    var user = testPage.querySelector("#switch-path-user");

                    expect(admin).toBeDefined();
                    expect(user).toBeDefined();
                    expect(admin.textContent).toBe("John");
                    expect(user.textContent).toBe("Mary");
                });
            });
        });
        describe("iterations", function() {
            it("should use the right template when an iteration is reused", function() {
                var component = testPage.test.templateObjects.switchPathIteration.templateObjects.alternation;

                component.content.pop();
                component.content.push({"name": "Louis", "isAdmin": true});

                testPage.waitForComponentDraw(component);
                runs(function() {
                    var admins = testPage.querySelectorAll("#switch-path-admin");
                    expect(admins.length).toBe(2);
                });
            });

            it("should change template when the switchPath evaluation changes", function() {
                var component = testPage.test.templateObjects.switchPathIteration.templateObjects.alternation;

                component.content[1].isAdmin = false;

                testPage.waitForComponentDraw(component);
                runs(function() {
                    var admins = testPage.querySelectorAll("#switch-path-user");
                    expect(admins.length).toBe(1);
                });
            });
        })
    });
});
