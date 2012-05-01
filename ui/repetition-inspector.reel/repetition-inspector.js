var Montage = require("montage").Montage,
    Component = require("ui/component").Component,
    ComponentTreeInspector = require("ui/component-tree-inspector.reel").ComponentTreeInspector;
    
var RepetitionInspector = exports.RepetitionInspector = Montage.create(Component, {
    repetition: {
        value: null
    },
    
    selected: {
        value: function(component) {
            ComponentTreeInspector.setPanel(this);
            this.repetition = component;
        }
    },
    
    iterations: {
        dependencies: ["repetition"],
        get: function() {
            return this.repetition._items.length;
        }
    },
    
    template: {
        dependencies: ["repetition"],
        get: function() {
            return this.repetition._iterationTemplate.exportToString();
        }
    }
});