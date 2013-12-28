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

    _getSwitchValue: {
        value: function(content, index) {
            return Montage.getPath.call({
                object: content,
                index: index
            }, this.switchPath);
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
            }

            return this._iterationTemplates[switchValue];
        }
    }
});
