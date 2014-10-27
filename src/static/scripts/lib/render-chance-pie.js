module.exports = function () {

    var chancePer = 0.33;

    var  pieTopPadding = 30;

    var chanceData = [{ x: 'chance', y: chancePer}, { x: 'base', y: 1 - chancePer }];
    var chancePie = new Contour({
            el: '.chance-pie',
            chart: {
                height: 140,
                padding: {
                    top: pieTopPadding
                }
            },
            pie: {
                innerRadius: 0.89,
                piePadding: {
                    top: 0.4,
                    left: 0.0
                }
            }
        })
        .pie(chanceData);


    chancePie.donutText({ value: chancePer });

    chancePie.adjustDonut();

    chancePie.chanceText();

    chancePie.averageValue({}, {
        average: this.average,
        pieTopPadding: pieTopPadding
    });
    
    chancePie.render();
};