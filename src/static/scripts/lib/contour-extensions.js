
Contour.export('averageValue', function (data, layer, options) {
    var rangeBand = this.rangeBand;
    var average = options.averageValue.average;
    var numberFormat = d3.format('$,.2f');

    var pieTopPadding = options.averageValue.pieTopPadding;

    var value = numberFormat(average)

    var horizontalPointer = layer.selectAll('.horizontal-pointer').data([null]);

    horizontalPointer.enter().append('line')
        .attr({
            class: 'horizontal-pointer',
            x1: 0,//x(point.y),
            y1: -pieTopPadding + 6,
            x2: options.chart.plotWidth,//,x(point.y),
            y2: -pieTopPadding + 6 //offset + y(point.x) + barWidth + 2,
        });

    var bounds = _.nw.textBounds(value, '.average-number');

    var averageBox = layer.selectAll('.average-box').data([null]);

    averageBox.enter().append('rect')
        .attr({
            class: 'average-box',
            x: 0, //options.chart.plotWidth - (bounds.width + 20),
            width: bounds.width + 20,
            height: bounds.height + 10,
            y: -pieTopPadding + 6
        });

    var averageValue = layer.selectAll('.grand-total').data([null]);

    averageValue.enter().append('text')
        .attr('class', 'average-number');

    averageValue
        .attr('x',  10) //options.chart.plotWidth - (bounds.width + 10))
        .attr('y', -12)// totalY + 4)
        .attr('dy', '.4em')
        .text(function() { return value});
});


Contour.export('connectLines', function (data, layer, options) {
    var rangeBand = this.rangeBand;
    var totalValue = options.connectLines.totalValue;
    var barWidth = 33; //rangeBand / 2 - options.bar.groupPadding;
    var totalsPadding = options.chart.padding.right;
    var numberFormat = d3.format('$,.0f');
    var totalY = barWidth;

    var value = numberFormat(totalValue)


    var verticalPointer = layer.selectAll('.vertical-pointer').data([null]);

    verticalPointer.enter().append('line')
        .attr({
            class: 'vertical-pointer',
            x1: 100,//x(point.y),
            y1: 0,
            x2: 100,//,x(point.y),
            y2:  options.chart.plotHeight //offset + y(point.x) + barWidth + 2,
        });

    var horizontalPointer = layer.selectAll('.horizontal-pointer').data([null]);

    horizontalPointer.enter().append('line')
        .attr({
            class: 'horizontal-pointer',
            x1: 0,//x(point.y),
            y1: 0,
            x2: 0,//,x(point.y),
            y2: 0 //offset + y(point.x) + barWidth + 2,
        });
});

Contour.export('adjustVertical', function (data, layer, options) {
    var donutTextNode =  d3.select(this.svg.selectAll('.vertical-pointer'))[0][0];

    var chartWidth = d3.select(this.svg.selectAll('rect'))[0][0].attr('width');

    var total = 400;
    var value = options.adjustVertical.average - 40;
    var x = value / total * chartWidth + 3;
    // var x = +donutTextNode.attr('x1') + 22;
    donutTextNode.attr('x1', x);

    donutTextNode.attr('x2', x);

    var donutTextNode =  d3.select(this.svg.selectAll('.horizontal-pointer'))[0][0];
    donutTextNode.attr('x2', x); 
});



Contour.export('chanceText', function (data, layer, options) {

    var chanceCopy = 'Chance of Loss';
    var bounds = _.nw.textBounds(chanceCopy, '.average-number');
    var chanceText = layer.selectAll('.chance-text').data([null]);

    chanceText.enter().append('text')
        .attr('class', 'chance-text');

    chanceText
        .attr('x', 0) //options.chart.plotWidth - (bounds.width) + 20
        .attr('y', 25)
        .attr('dy', '.4em')
        .text(function() { return chanceCopy});
});

Contour.export('adjustDonut', function (data, layer, options) {
    var donutTextNode =  d3.select(this.svg.selectAll('.donut-text'))[0][0];
    var x = donutTextNode.attr('x');
    donutTextNode.attr('x', 20);
    var y = donutTextNode.attr('y');
    donutTextNode.attr('y', y - 6);
    
});