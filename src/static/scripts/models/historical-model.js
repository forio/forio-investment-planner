var BaseModel = require('base-model');

module.exports = BaseModel.extend({

    toJSON: function () {
        var json = BaseModel.prototype.toJSON.apply(this, arguments);

        json.average = d3.format('%.2f')(json.average);

        return json;
    }
});