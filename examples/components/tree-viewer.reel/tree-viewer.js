/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2012 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage").Montage,
    Component = require("ui/component").Component,
    ArrayController = require("ui/controller/array-controller").ArrayController;

var TreeViewer = exports.TreeViewer = Montage.create(Component, {
    data: {
        serializable: "reference",
        set: function(value) {
            this.dataController.content = this._data = value;
        },
        get: function() {
            return this.dataController.content;
        }
    },

    dataController: {
        value: null
    },

    leaf: {
        serializable: true,
        value: null
    },

    didCreate: {
        value: function() {
            this.dataController = ArrayController.create();
            Object.defineBinding(this, "selectedData", {
                boundObject: this.dataController,
                boundObjectPropertyPath: "selectedObjects.0",
                oneway: true
            });
        }
    },

    prepareForDraw: {
        value: function() {
            this._element.addEventListener("mouseover", this, false);
            this._element.addEventListener("mouseout", this, false);
        }
    },

    handleMouseover: {
        value: function(event) {
            var delegate = this.delegate;

            event.stopPropagation();
            if (delegate && delegate.treeItemOver && event.target.classList.contains("montage-tree-viewer-label")) {
                var index = this.repetition._itemIndexOfElement(event.target)
                delegate.treeItemOver(this._data[index]);
            }
        }
    },

    handleMouseout: {
        value: function(event) {
            var delegate = this.delegate;

            event.stopPropagation();
            if (delegate && delegate.treeItemOut && event.target.classList.contains("montage-tree-viewer-label")) {
                var index = this.repetition._itemIndexOfElement(event.target);
                delegate.treeItemOut(this._data[index]);
            }
        }
    },

    draw: {
        value: function() {
            if (this._isVisible) {
                this._element.style.display = "block";
            } else {
                this._element.style.display = "none";
            }
        }
    },

    /*
     * Available delegate functions:
     * - treeItemSelected(data): called when an item is selected (clicked)
     */
    delegate: {
        value: null
    },

    _isVisible: {
        value: true
    },

    isVisible: {
        set: function(value) {
            if (this._isVisible != value) {
                this._isVisible = value;
                this.needsDraw = true;
            }
        }
    },

    _selectedData: {
        value: null
    },

    selectedData: {
        set: function(data) {
            var delegate = this._delegate;

            this._selectedData = data;
            if (data != null && delegate && typeof delegate.treeItemSelected === "function") {
                delegate.treeItemSelected(data.data);
            }
        },
        get: function(data) {
            return this._selectedData;
        }
    }
});