var Montage = require("montage").Montage,
    Component = require("ui/component").Component,
    ComponentTreeInspector = require("ui/component-tree-inspector.reel").ComponentTreeInspector;

var ComponentInspector = exports.ComponentInspector = Montage.create(Component, {
    component: {
        value: null
    },

    componentHighlighter: {
        serializable: true,
        value: null
    },

    prepareForDraw: {
        value: function() {
            this.element.ownerDocument.body.appendChild(this.componentHighlighter);
            this.hightlightComponent();
        }
    },

    hightlightComponent: {
        value: function() {
            var componentHighlighter = this.componentHighlighter;

            if (!componentHighlighter) {
                return;
            }
            var component = this.component,
                rect = component.element.getBoundingClientRect();

            componentHighlighter.style.top = (rect.top-1 + window.pageYOffset) + "px";
            componentHighlighter.style.left = (rect.left-1 + window.pageXOffset) + "px";
            componentHighlighter.style.width = rect.width + "px";
            componentHighlighter.style.height = rect.height + "px";
            componentHighlighter.style.position = "absolute";
        }
    },

    selected: {
        value: function(component) {
            ComponentTreeInspector.setPanel(this);
            this.component = component;
            this.hightlightComponent();
        }
    },

    bindings: {
        dependencies: ["component"],
        get: function() {
            var bindingDescriptors = this.component._bindingDescriptors,
                bindings = [],
                binding;

            for (var key in bindingDescriptors) {
                binding = bindingDescriptors[key];
                direction = "<-" in binding ? "<-" : ("<->>" in binding ? "<->>" : ("->" in binding ? "->" : ("<<->" in binding ? "<<->" : null)));
                bindings.push({
                    leftSide: key,
                    direction: direction,
                    rightSide: binding[direction]
                });
            }

            return bindings;
        }
    },

    handleLeftSideAction: {
        value: function(event) {
            var propertyName = event.target.label;

            console.log(propertyName + ": " , this.component[propertyName]);
        }
    }
});