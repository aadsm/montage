var Montage = require("montage").Montage,
    Connection = require("q-connection"),
    defaultEventManager = require("core/event/event-manager").defaultEventManager,
    rootComponent = require("ui/component").__root__;

var MontageInspector = exports.MontageInspector = Montage.specialize({
    constructor: {
        value: function MontageInspector() {
            this.super();
        }
    },

    _connection: {
        value: null
    },

    connect: {
        value: function(channel) {
            this._connection = Connection(channel, LocalInspector);
        }
    },

    getRootComponent: {
        value: function() {
            return new LocalComponent(rootComponent);
        }
    }
});

var LocalInspector = Montage.specialize({
    constructor: {
        value: function LocalInspector() {
            this.super();
        }
    }
}, {
    getRootComponent: function() {
        return MontageInspector.getRootComponent();
    }
});

var LocalComponent = Montage.specialize({
    constructor: {
        value: function LocalComponent() {
            this.super();
        }
    }
});