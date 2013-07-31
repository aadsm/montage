/*global require,exports,describe,it,expect */
var Montage = require("montage").Montage;
var Overlay = require("montage/ui/overlay.reel").Overlay;
var MockDOM = require("mocks/dom");
var Event = require("mocks/event");

describe("ui/overlay-spec", function() {
    var anOverlay;

    beforeEach(function() {
        anOverlay = new Overlay();
        anOverlay.hasTemplate = false;
        anOverlay.element = MockDOM.element();
        anOverlay.modalMaskElement = MockDOM.element();
    });

    describe("position calculation", function() {
        it("should use the overlay position property", function() {
            anOverlay.position = {left: 100, top: 100};
            anOverlay._calculatePosition();
            expect(anOverlay._drawPosition).toEqual({left: 100, top: 100});
        });

        it("should calculate the overlay position to be in the middle of the screen when no position hints are given", function() {
            var aWindow = anOverlay.element.ownerDocument.defaultView;

            aWindow.innerWidth = 700;
            aWindow.innerHeight = 600;
            anOverlay.element.offsetWidth = 100;
            anOverlay.element.offsetHeight = 50;

            anOverlay._calculateOwnBoundingRect();
            anOverlay._calculatePosition();
            expect(anOverlay._drawPosition).toEqual({left: 300, top: 275});
        });

        describe("anchor position", function() {
            it("should center the element bellow the anchor", function() {
                var anAnchor = MockDOM.element();

                anAnchor.offsetTop = 100;
                anAnchor.offsetLeft = 200;
                anAnchor.offsetWidth = 100;
                anAnchor.offsetHeight = 100;

                anOverlay.anchor = anAnchor;
                anOverlay.element.offsetWidth = 50;
                anOverlay.element.offsetHeight = 100;
                anOverlay._calculateOwnBoundingRect();
                anOverlay._calculatePosition();

                expect(anOverlay._drawPosition).toEqual({left: 225, top: 200});
            });

            it("should center the element bellow the anchor and bump it to the right because it's left outside the screen", function() {
                var anAnchor = MockDOM.element();

                anAnchor.offsetTop = 100;
                anAnchor.offsetLeft = 0;
                anAnchor.offsetWidth = 100;
                anAnchor.offsetHeight = 100;

                anOverlay.anchor = anAnchor;
                anOverlay.element.offsetWidth = 110;
                anOverlay.element.offsetHeight = 100;
                anOverlay._calculateOwnBoundingRect();
                anOverlay._calculatePosition();

                expect(anOverlay._drawPosition).toEqual({left: 0, top: 200});
            });
        });
    });

    describe("delegate", function() {
        it("should call willPositionOverlay", function() {
            var delegate = {
                willPositionOverlay: jasmine.createSpy()
            };

            anOverlay.delegate = delegate;
            anOverlay.position = {
                left: 100,
                top: 50
            };

            anOverlay._calculatePosition();

            expect(delegate.willPositionOverlay).toHaveBeenCalledWith(anOverlay, anOverlay.position);
        });
    });

    describe("_isDisplayed", function() {
        it("should be false before it is measurable", function() {
            anOverlay._isShown = false;
            anOverlay._isDisplayed = true;

            anOverlay.draw();

            expect(anOverlay._isDisplayed).toBe(false);
        });

        it("should be true after it is measurable", function() {
            anOverlay._isShown = true;
            anOverlay._isDisplayed = false;

            anOverlay.draw();

            expect(anOverlay._isDisplayed).toBe(true);
        });
    });

    describe("draw", function() {
        beforeEach(function() {
            var aWindow = anOverlay.element.ownerDocument.defaultView;

            aWindow.innerWidth = 700;
            aWindow.innerHeight = 600;
        });

        it("should be requested after show() when hidden", function() {
            anOverlay._isShown = false;

            anOverlay.show();

            expect(anOverlay.needsDraw).toBe(true);
            expect(anOverlay.classList.has("montage-Overlay--visible")).toBe(true);
        });

        it("should be requested after hide() when shown", function() {
            anOverlay._isShown = true;

            anOverlay.hide();

            expect(anOverlay.needsDraw).toBe(true);
            expect(anOverlay.classList.has("montage-Overlay--visible")).toBe(false);
        });

        it("should not calculate position on willDraw when content is not shown", function() {
            anOverlay._isDisplayed = false;
            anOverlay._isShown = true;

            anOverlay.willDraw();

            expect(anOverlay._drawPosition).toBe(null);
        });

        it("should turn the element invisible when it's not measurable and request another draw", function() {
            anOverlay._isDisplayed = false;
            anOverlay._isShown = true;

            anOverlay.draw();

            expect(anOverlay.element.style.visibility).toBe("hidden");
            expect(anOverlay._isDisplayed).toBe(true);
            expect(anOverlay.needsDraw).toBe(true);
        });

        it("should calculate the position on willDraw", function() {
            spyOn(anOverlay, "_calculatePosition");
            anOverlay._isDisplayed = true;
            anOverlay._isShown = true;

            anOverlay.willDraw();

            expect(anOverlay._calculatePosition).toHaveBeenCalled();
        });

        it("should position the element when it's measurable", function() {
            anOverlay._isDisplayed = true;
            anOverlay._isShown = true;
            anOverlay.element.offsetWidth = 100;
            anOverlay.element.offsetHeight = 50;
            anOverlay._calculateOwnBoundingRect();
            anOverlay._calculatePosition();

            anOverlay.draw();

            expect(anOverlay.element.style.visibility).toBe("visible");
            expect(anOverlay.element.style.marginTop).toBe("275px");
            expect(anOverlay.element.style.marginLeft).toBe("300px");
        });

        it("should be requested on window resize when shown", function() {
            anOverlay._isShown = true;
            anOverlay.handleResize();

            expect(anOverlay.needsDraw).toBe(true);
        });

        it("should not be requested on window resize when hidden", function() {
            anOverlay._isShown = false;
            anOverlay.handleResize();

            expect(anOverlay.needsDraw).toBe(false);
        });
    });

    describe("dismissal", function() {
        it("should hide the overlay when a pressStart is fired outside the overlay", function() {
            var event = Event.event();

            anOverlay.enterDocument(true);

            anOverlay._isShown = true;
            anOverlay._isDisplayed = true;
            event.target = MockDOM.element();
            anOverlay._pressComposer._dispatchPressStart(event);
            expect(anOverlay._isShown).toBe(false);
        });

        it("should not hide the overlay when a pressStart is fired inside the overlay", function() {
            var event = Event.event();

            anOverlay.enterDocument(true);

            anOverlay._isShown = true;
            anOverlay._isDisplayed = true;
            event.target = MockDOM.element();
            anOverlay.element.appendChild(event.target);

            anOverlay._pressComposer._dispatchPressStart(event);
            expect(anOverlay._isShown).toBe(true);
        });
    });

    describe("events", function() {
        it("should fire dismiss event when overlay is dismissed", function() {
            var event = Event.event(),
                callback = jasmine.createSpy();

            anOverlay.enterDocument(true);

            anOverlay._isShown = true;
            anOverlay._isDisplayed = true;
            event.target = MockDOM.element();

            anOverlay.addEventListener("dismiss", callback, false);

            anOverlay._pressComposer._dispatchPressStart(event);
            expect(callback).toHaveBeenCalled();
        });
    });
});
