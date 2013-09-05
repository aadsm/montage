/**
 * This connector code was mostly borrowed from @kriskowal's Q's client side
 * debugging code.
 */
var Montage = require("montage").Montage;

exports.ChromeInspectorConnector = Montage.specialize({
    constructor: {
        value: function ChromeInspectorConnector() {
            this.super();
        }
    },

    init: {
        value: function() {
            var self = this;

            this._addPortListener(window, {
                "can-inspect-montage": function() {
                    var channel = new MessageChannel();
                    self._port = channel.port1;
                    window.postMessage(["montage-inspector-channel"], [channel.port2], window.location.origin);
                    self._addPortListener(self._port, {
                        "inspect-montage": self._inspectMontage
                    });
                }
            });

            window.postMessage(["montage-can-be-inspected"], window.location.origin);
        }
    },

    _addPortListener: {
        value: function (port, handlers) {
            port.addEventListener("message", function (event) {
                var message = event.data;
                if (Array.isArray(message) && message.length) {
                    var type = message[0];
                    var handler = handlers[type];
                    if (handler) {
                        handler.apply(event, message.slice(1));
                    }
                }
            });
        }
    },

    _inspectMontage: {
        value: function() {
            var port = this._port;

            require.async("debug/montage-inspector")
            .then(function(exports) {
                var MontageInspector = exports.MontageInspector;

                new MontageInspector().connect(port);
            });
        }
    }
});