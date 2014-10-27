var BaseCollection = Backbone.Collection;

var HistoricalModel = require('models/historical-model');
module.exports = BaseCollection.extend({

    model: HistoricalModel,
})