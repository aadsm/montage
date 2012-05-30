var Montage = require("montage").Montage,
    Template = require("ui/template").Template,
    Component = require("ui/component").Component;

var ComponentTreeInspector = exports.ComponentTreeInspector = Montage.create(Component, {
    _components: {
        value: {}
    },

    _componentInspector: {
        value: null
    },

    isVisible: {
        value: false
    },

    panel: {
        serializable: true,
        value: null
    },

    templateModuleId: {
        value: "ui/component-tree-inspector.reel/component-tree-inspector.html"
    },

    init: {
        value: function() {
            this._componentInspector = require("ui/component-inspector.reel").ComponentInspector.create();
            document.addEventListener("keyup", this, false);
            document.addEventListener("keydown", this, false);
        }
    },

    registerComponent: {
        value: function(componentType, delegate) {
            this._components[componentType.uuid] = delegate;
        }
    },

    handleKeyup: {
        value: function(event) {
            if (event.which == 17) {
                this.isCtrl = false;
            } else if (event.which == 18) {
                this.isAlt = false;
            }
        }
    },

    handleKeydown: {
        value: function(event) {
            if (event.which == 17) {
                this.isCtrl = true;
            } else if (event.which == 18) {
                this.isAlt = true;
            } else if (event.which == 73 && this.isCtrl === true && this.isAlt === true) {
                if (this.isVisible) {
                    this.hide();
                } else {
                    this.show();
                }
                return false;
            }
        }
    },

    componentTree: {
        value: null
    },

    setupComponentTree: {
        value: function() {
            var root = Object.create(ComponentTreeData);
            root.data = this.rootComponent;
            this.componentTree = root.children;
        }
    },

    show: {
        value: function() {
            if (!this._element) {
                this.element = document.body.appendChild(document.createElement("div"));
                this.attachToParentComponent();
                this.needsDraw = true;
            } else {
                this.element.style.display = "block";
            }
            this.setupComponentTree();
        }
    },

    hide: {
        value: function() {
            this.element.style.display = "none";
        }
    },

    setPanel: {
        value: function(panel) {
            this.panel.content = panel;
        }
    },

    treeItemSelected: {
        value: function(component) {
            var componentType = Object.getPrototypeOf(component),
                delegate = this._components[componentType.uuid];

            if (delegate) {
                if (typeof delegate.selected === "function") {
                    delegate.selected(component);
                }
            } else {
                this._componentInspector.selected(component);
            }
        }
    }
});

var ComponentTreeData = Object.create(Object.prototype, {
    _data: {
        value: null
    },

    data: {
        get: function() {
            return this._data;
        },
        set: function(value) {
            var children = this.children,
                childComponents;

            if (this._data) {
                this._data.removePropertyChangeListener("childComponents", this);
                for (var i = 0, l = children.length; i < l; i++) {
                    children[i].data = null;
                }
            }
            this.children = null;
            if (value) {
                this.label = value._montage_metadata.objectName + " (" + value.identifier + ")";
                childComponents = value.childComponents;
                children = [];
                for (var i = 0, l = childComponents.length; i < l; i++) {
                    if (ComponentTreeInspector === childComponents[i]) {
                        continue;
                    }
                    children[i] = Object.create(ComponentTreeData);
                    children[i].data = childComponents[i];
                }
                this.children = children;
                value.addPropertyChangeListener("childComponents", this);
            }

            this._data = value;
        }
    },

    handleChange: {
        value: function(notification) {
            this._updateChildren(notification.index, notification.minus, notification.plus);
        }
    },

    _updateChildren: {
        value: function(index, minus, plus) {
            var children = this.children,
                child;

            // remove
            for (var i = 0; i < minus.length; i++) {
                children[index+i].data = null;
            }
            children.splice(index, minus.length);
            // add
            for (var i = 0; i < plus.length; i++) {
                child = Object.create(ComponentTreeData);
                child.data = plus[i];
                children.splice(index+i, 0, child);
            }
        }
    },

    label: {
        value: null
    },

    children: {
        value: null
    }
});

ComponentTreeInspector.init();