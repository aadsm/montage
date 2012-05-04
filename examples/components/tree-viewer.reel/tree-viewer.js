/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2012 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage").Montage,
    Component = require("ui/component").Component;

var TreeViewer = exports.TreeViewer = Montage.create(Component, {
    data: {
        value: null
    },

    leaf: {
        serializable: true,
        value: null
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
