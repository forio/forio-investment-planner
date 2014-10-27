var BaseModel = require('base-model');

module.exports = BaseModel.extend({

    defaults: function () {
        return {
            us: 0.12,
            emerging: 0.28,
            bonds: 0.264,
            realEstate: 0.218,
            cash: 0.118
        };
    },


    toggleInputs: function () {
        return [
            {
                name: 'US Stocks',
                value: this.get('us'),
                variable: 'us'
            },
            {
                name: 'Emerging Markets',
                value: this.get('emerging'),
                variable: 'emerging'
            },
            {
                name: 'Global Bonds',
                value: this.get('bonds'),
                variable: 'bonds'
            },
            {
                name: 'Global Reas Estate',
                value: this.get('realEstate'),
                variable: 'realEstate'
            },
            {
                name: 'Cash Equivalents',
                value: this.get('cash'),
                variable: 'cash'
            }];
    }
});