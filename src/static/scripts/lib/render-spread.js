module.exports = function (buckedData, chance, totalValue) {
    var data = buckedData;

    this.renderChancePie(chance);

    var tickValues = []
    var resultsSpread = new Contour({
            el: '.return-bar',
            chart: {
                padding: {
                    left: 0,
                    right: 0
                },
                height: 160
            },
            xAxis: {
                innerTickSize: 0,
                outerTickSize: 0,
                strokeWidth: '0px',
                // tickValues: [2,4,6,8,10],
                // ticks: 5,
                labels: {
                    formatter: function (g) {
                        return (g + 1) * 40 + '$';
                    }
                }
            },
            yAxis: {
                innerTickSize: 0,
                outerTickSize: 0,
                strokeWidth: 0
            }
        })
        .cartesian()
        .column(data);

    resultsSpread.connectLines(data, {
        average: this.average
    })
    resultsSpread.render();

    resultsSpread.adjustVertical(data, {
        average: this.average,
        totalValue: totalValue
    });

    resultsSpread.render();
    };