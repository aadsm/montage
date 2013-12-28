/**
 * @module montage/ui/repetition.reel
 */
var Montage = require("montage").Montage;
var Component = require("ui/component").Component;
var Promise = require("core/promise").Promise;

var Repetition = require("ui/repetition.reel/repetition").Repetition;

exports.Alternation = Repetition.specialize( /** @lends Alternation# */ {
    /**
     * @private
     */
    constructor: {
        value: function Alternation() {
            this.super();
            this._iterationTemplates = {};
            this._freeAlternationIterations = {};
        }
    },

    switchPath: {
        value: null
    },

    /**
     * @type {Object.<string, Template>}
     * @private
     */
    _iterationTemplates: {
        value: null
    },

    /**
     * @type {Object.<string, Iteration>}
     * @private
     */
    _freeAlternationIterations: {
        value: null
    },

    _getIteration: {
        value: function(content, index) {
            var iteration = this.super(content, index);

            iteration.addPathChangeListener(this.switchPath, this.handleIterationSwitchValueChange);

            return iteration;
        }
    },

    _createIteration: {
        value: function(content, index) {
            var iteration = new this.Iteration().initWithRepetition(this),
                switchValue,
                iterationTemplate;

            iteration.content = content;
            iteration.index = index;
            switchValue = this._getSwitchValue(content, index);
            iteration.switchValue = switchValue;
            iterationTemplate = this._getIterationTemplateBySwitchValue(switchValue);
            this._instantiateIterationTemplate(iteration, iterationTemplate);

            return iteration;
        }
    },

    _getFreeIteration: {
        value: function(content, index) {
            var iteration,
                switchValue,
                iterations;

            switchValue = this._getSwitchValue(content, index);
            iterations = this._freeAlternationIterations[switchValue];

            if (iterations && iterations.length > 0) {
                iteration = iterations.pop();
                iteration.content = content;
                iteration.index = index;
                iteration.switchValue = switchValue;
                return iteration;
            } else {
                return null;
            }
        }
    },

    _getSwitchValue: {
        value: function(content, index) {
            return Montage.getPath.call({
                object: content,
                index: index
            }, this.switchPath);
        }
    },

    _recycleIteration: {
        value: function(iteration) {
            var switchValue = iteration.switchValue;

            iteration.removePathChangeListener(this.switchPath, this.handleIterationSwitchValueChange);
            iteration.recycle();
            // Add it back to the free list so it can be reused.
            this._freeAlternationIterations[switchValue].push(iteration);
        }
    },

    handleIterationSwitchValueChange: {
        value: function(value, key, object) {
            if (object.switchValue !== value) {
                // Implement this as a simulation of content being changed, we
                // indicate that we removed and added the same content.
                var data = [object.content];
                object.repetition.handleOrganizedContentRangeChange(data, data, object.index);
            }
        }
    },

    /**
     * @param {string} switchPath
     * @returns Template
     * @private
     */
    _getIterationTemplateBySwitchValue: {
        value: function(switchValue) {
            var iterationTemplate;

            if (!this._iterationTemplates.hasOwnProperty(switchValue)) {
                // TODO: test with multiple data-arg with the same name.
                var element = this._getTemplateDomArgument(switchValue);
                if (!element) {
                    throw new Error("Cannot find " + switchValue); // TODO: better error message
                }
                iterationTemplate = this.innerTemplate.createTemplateFromDomElement(element);
                iterationTemplate.setInstances(this.innerTemplate._instances);
                this._iterationTemplates[switchValue] = iterationTemplate;
                this._freeAlternationIterations[switchValue] = [];
            }

            return this._iterationTemplates[switchValue];
        }
    },

    _teardownIterationTemplate: {
        value: function() {
            this.super();

            Object.keys(this._freeAlternationIterations).forEach(function(key) {
                var iterations = this._freeAlternationIterations[key];
                for (var i = 0; i < iterations.length; i++) {
                    this._teardownFreeIteration(iterations[i]);
                }
            }, this);

            this._freeAlternationIterations.clear();
        }
    }
});
