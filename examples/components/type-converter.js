/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2012 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage").Montage;
var Converter = require('core/converter/converter').Converter;

exports.TypeConverter = Montage.create(Converter, {
    convert: {value: function(value) {
        if (typeof value.children === "undefined") {
            return "leaf";
        } else {
            return "branch";
        }
    }}
});
