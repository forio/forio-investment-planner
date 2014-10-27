'use strict';

window.CONFIG = {
    getLabel: function (key, config) {
        var label = config[key];
        if (label) {
            return label[App.config.get('language')];
        }

        return key;
    },

    getVariable: function (key, config) {
        var variable = config[key].variable;
        if (variable) {
            return variable;
        }

        return key;
    },

    getType: function (key, config) {
        var type = config[key].type || 'number';
        return CONFIG.types[type];
    }
};
