(function () {
    var defaults = {
        dataLegend: {
            format: ',.1f',
        }
    };

    function dataLegend(data, layer, options) {
        var formatter = options.dataLegend.formatter ? options.dataLegend.formatter : d3.format(options.dataLegend.format);
        var barCenter = this.rangeBand / 2;
        var x = this.xScale, y = this.yScale;
        var duration = options.chart.animations.duration || 0;
        var em = _.nw.textBounds('123456789', '.label-text').height;

        var labels = layer.selectAll('.label-text')
            .data(data[0].data);

        labels.enter().append('text')
            .attr('class', 'label-text');

        labels
            .attr('fill', function (d) {
                var v = y(d.y) + em;
                var max = options.chart.plotHeight - em;
                var res = v <= max ? '#eee' : '#888';

                return res;
            })
            .attr('x', function (d) { return x(d.x) + barCenter; })
            .attr('text-anchor', 'middle')
            .text(function (d) { return formatter(d.y); })
            .attr('y', y(options.yAxis.min || 0))
            .transition().duration(duration)
            .attr('y', function (d) {
                var v = y(d.y) + em;
                var max = options.chart.plotHeight - em;
                return Math.round(v <= max ? v : v - em - 3);
            });

        labels.exit().remove();
    }

    dataLegend.defaults = defaults;

    Contour.export('dataLegend', dataLegend);
})();
;(function () {
    /*jshint eqnull:true */
    'use strict';

    var defaults = {
        dataTable: {
            cellFormatter: function (d, i, j, options) {

                var formatter = options.yAxis.labels.formatter != null ? options.yAxis.labels.formatter : d3.format(options.yAxis.labels.format || 'g');
                var format = function (d) { return d != null ? formatter(d) : ''; };
                var val = d ? d.y : null;
                var cellTemplate = _.template('<%= formatter(val) %>');

                return  cellTemplate({ val: val, formatter: format });
            },

            seriesNameFormatter: function (series) {
                return series.name;
            }
        }
    };

    function firstCellFormatter(formattedSeries, formattedCell) {
        var firstCellTemplate = _.template('<div style="position:relative"><span class="series-name"><%= formattedSeries %></span></div><div class="first-point data-cell"><%= formattedCell %></div>');
        return firstCellTemplate({formattedSeries: formattedSeries, formattedCell: formattedCell });
    }

    var dataTable = function (raw, layer, options) {
        var _this = this;
        var range = this._xAxis.scale().range();
        var fullWidth = range[1] - range[0];
        var firstOffset = this.rangeBand / 2 - 4;
        var classFn = function (d, i, j) { return 'series s-' + (i+1) + ' ' + d.name; };
        var onlyDataForTicks = function (ds, ticks) {
            return _.map(ds, function (series) {
                var seriesData = _.filter(series.data, function (r) {
                    return ticks.indexOf(r.x) !== -1;
                });
                return _.extend({}, series, { data: seriesData });
            });
        };

        var table = this.container.selectAll('.contour-data-table').data([null]);
        var tableStyles = [
            'margin-left: ' + (options.chart.internalPadding.left) + 'px',
            'width: ' + fullWidth + 'px'
        ];

        table.enter().append('table')
            .attr('class', 'contour-data-table')
            .attr('style', tableStyles.join('; '));

        var ticks = options.xAxis.tickValues == null ? this.xScale.ticks ?
                this.xScale.ticks(options.xAxis.ticks) : this.xDomain : options.xAxis.tickValues;
        var ticksX = _.map(ticks, function (t) { return _this.xScale(t); });
        var data = onlyDataForTicks(raw, ticks);

        var rows = table.selectAll('tr').data(data);
        rows.enter().append('tr').attr('class', classFn);
        rows.exit().remove();

        var cells = rows.selectAll('td').data(ticks);
        cells.enter().append('td');
        cells.exit().remove();

        var prev = 0;

        cells
            .attr('data-x', function (y, i, j) {
                return data[j].data[i] ? data[j].data[i].x : 'na';
            })
            .attr('style', function (d, i, j) {
                if (j > 0) return;
                var styles = [];
                var w = ticksX[i] - prev + (i === 0 ? firstOffset : 0);
                prev = ticksX[i];
                styles.push('width: ' + w + 'px');
                return styles.join('; ');
            })
            .html(function (t, i, j) {
                var d = data[j].data[i];

                if (i === 0) {
                    var cellHtml = options.dataTable.cellFormatter.call(this, d, i, j, options);
                    var seriesHtml = options.dataTable.seriesNameFormatter.call(this, raw[j], options);
                    return firstCellFormatter(seriesHtml, cellHtml);
                } else {
                    return '<span class="data-cell">' + options.dataTable.cellFormatter.call(this, d, i, j, options) + '</span>';
                }
            });

    };

    dataTable.defaults = defaults;
    Contour.export('dataTable', dataTable);

})();
;(function () {
    'use strict';
    Contour.export('donutText', function (data, layer, options) {
        function resolveValue(v, r) { return v > 0 && v < 1 ? v * r : v; }
        var offsetX = data.offsetX || 0;
        var offsetY = data.offsetY || 0;
        var formatter = options.donutText.formatter || d3.format('%');
        var paddingTop = resolveValue(options.pie.piePadding.top, options.chart.height);
        var w = options.chart.plotWidth;
        var h = options.chart.plotHeight - paddingTop;
        var rad = resolveValue(options.pie.outerRadius || 0.5, Math.min(h, w));
        var centerX = options.pie.piePadding.left ? resolveValue(options.pie.piePadding.left, Math.max(w, h)) + rad :
            w / 2;
        var centerY = h / 2 + paddingTop;


        var el = layer.selectAll('.center-text').data([null]);
        el.enter().append('text')
            .attr('class', 'center-text donut-text')
            .attr('x', centerX + offsetX)
            .attr('y', centerY + offsetY)
            .attr('dy', '.41em');

        el.text(formatter(data.value));

        var bb = layer.select('text').node().getBBox();

        var label = layer.selectAll('.donut-text.label').data([null]);

        label.enter().append('text')
            .attr('class', 'donut-text label')
            .attr('x', centerX + offsetX)
            .attr('y', centerY + offsetY + bb.height)
            .attr('dy', '-.31em');

        label.text(data.label);


    });
})();
;
(function () {
    'use strict';

    function Drawable(data, layer, options) {
        var w = options.chart.plotWidth;
        var h = options.chart.plotHeight;
        var _this = this;
        var prevPoint;
        var grab = false;

        var points = data[0].data;

        layer.selectAll('.mouse-tracker').data([1])
        .enter()
        .append('rect').attr({
            'class': 'mouse-tracker',
            'width': w,
            'height': h,
            'x': 0,
            'y': 0,
            'fill': 'transparent'
        })
        .on('mousedown.draw', function () {
            grab = true;
            var refElement = this;
            prevPoint = d3.mouse(refElement);

            d3.select('body')
                .attr('style', 'cursor: pointer')
                .on('mouseup.draw', function () {
                    update.call(refElement, refElement, true);
                    grab = false;
                    d3.select(this)
                        .on('mousemove.draw', null).on('mouseup.draw', null)
                        .attr('style', 'cursor: default');
                })
                .on('mousemove.draw', function () {
                    if (!grab) return;
                    update.call(this, refElement, false);
                });
        });

        /*jshint eqnull:true*/
        function update(refLayer, animate) {
            animate = animate != null ? animate : false;
            var x = _this.xScale;
            var y = _this.yScale;
            var mouseXIndex = options.chart.rotatedFrame ? 1 : 0;
            var mouseYIndex = options.chart.rotatedFrame ? 0 : 1;
            var bisect = options.chart.rotatedFrame ?
                    function (range, x) { return d3.bisect(range, h - x); } :
                    function (range, x) { return d3.bisect(range, x); };

            var mouse = d3.mouse(refLayer);

            var domain, d, r, xData, prevX;

            if (!x.invert) {
                // ordinal x scales
                domain = x.domain();
                d = d3.range(domain.length);
                r = options.chart.rotatedFrame ? x.range().slice().reverse() : x.range();

                xData = d[_.nw.clamp(bisect(r, mouse[mouseXIndex]) - 1, 0, d.length -1)];
                prevX = d[_.nw.clamp(bisect(r, prevPoint[mouseXIndex]) - 1, 0, d.length -1)];
            } else {
                // linear x scale
                domain = d3.range(x.domain()[0], x.domain()[1] + options.drawable.step, options.drawable.step);
                d = domain;
                r = options.chart.rotatedFrame ? x.range().slice().reverse() : x.range();
                xData = bisect(d, _this.xScale.invert(mouse[mouseXIndex]));
                prevX = bisect(d, _this.xScale.invert(prevPoint[mouseXIndex]));
            }

            var min = options.yAxis.min || 0;
            var max = options.yAxis.max || d3.max(d);
            var leftRight = prevX < xData;
            var lowX = leftRight ? prevX : xData;
            var highX = !leftRight ? prevX : xData;
            var upDown = prevPoint[mouseYIndex] < mouse[mouseYIndex];
            var lowY = upDown ? prevPoint[mouseYIndex] : mouse[mouseYIndex];
            var highY = !upDown ? prevPoint[mouseYIndex] : mouse[mouseYIndex];
            // generate an interpolator from the lowset Y to the highest Y
            var interpolator = !upDown ?
                d3.interpolateNumber(highY, lowY) :
                d3.interpolateNumber(lowY, highY);

            var curX = lowX;
            do {
                // now calculate the t differently depending on
                // whether we are moving left to right or right to left
                var t = highX === lowX ? 1 : leftRight ? (curX - lowX) / (highX - lowX) : (curX - highX) / (lowX - highX);
                var mouseY = interpolator(t);
                var yData = y.invert(mouseY);
                var newY =  _.nw.clamp(yData, min, max);
                if (options.drawable.canUpdate(domain[curX], newY, curX)) {
                    points[d[curX]] = { x: domain[curX], y: newY };
                }
            } while(++curX < highX);

            var prevAnimSetting = _this.options.chart.animations;
            _this.options.chart.animations = animate;
            _this.setData(points).render();
            _this.options.chart.animations = prevAnimSetting;

            prevPoint = mouse;
        }
    }

    Drawable.defaults = {
        drawable: {
            // for linear xScale, this indicates the
            // resolution in x domain to allway to draw points
            step: 1,
            canUpdate: function (x, y, i) { return true; }
        }
    };

    /**
    *
    * This visualization requires `.cartesian()`.
    *
    * ### Example:
    *
    *     new Contour({el: '.chart'})
    *           .cartesian()
    *           .drawable()
    *           .render();
    *
    */
    Contour.export('drawable', Drawable);

})();
;(function () {

    var defaults = {
        multiLineText: {
            selector: '.axis text',
            lineBreakAt: '<br>',
            removeLineBreakChar: true,
            keepCentered: false
        }
    };

    function multiLineText(layer, data, options) {
        var selector = options.multiLineText.selector;
        var lineBreakAt = options.multiLineText.lineBreakAt;

        var insertLinebreaks = function () {
            var el = d3.select(this);
            var em = _.nw.textBounds('1234567789abcj', selector).height;
            var words = (el.text() || '').split(lineBreakAt);
            var x = el.attr('x') || 0;
            var dy = el.attr('dy');
            var numNewLines = options.multiLineText.keepCentered ? words.length - 1 : 0;
            var offsetY = -em * numNewLines / 2;

            el.text('')
                .attr('dy', function () { return numNewLines ? offsetY : dy; });

            for (var i = 0; i < words.length; i++) {
                var newText = !options.multiLineText.removeLineBreakChar && i < words.length - 1 ?
                    words[i]+lineBreakAt :
                    words[i];
                var tspan = el.append('tspan').text(newText);

                if (i > 0) {
                    tspan.attr('x', x).attr('dy', em + 2);
                }
            }
        };

        this.svg.selectAll(selector).each(insertLinebreaks);
    }

    multiLineText.defaults = defaults;

    Contour.export('multiLineText', multiLineText);

})();
;(function () {
    'use strict';
    /* jshint eqnull:true */

    var defaults = {
        pieCallouts: {
            distance: 20,
            textPadding: 5
        }
    };


    function resolveNumber(value, ref) {
        return value > 0 && value < 1 ? value * ref : value;
    }

    function resolvePadding(options) {
        var w = options.chart.plotWidth;
        var h = options.chart.plotHeight;

        return {
            top: resolveNumber(options.pie.piePadding.top, h),
            bottom: resolveNumber(options.pie.piePadding.bottom, h),
            left: resolveNumber(options.pie.piePadding.left, w),
            right: resolveNumber(options.pie.piePadding.right, w),
        };
    }

    // render pie labels as call outs with value and category
    function pieCallouts (data, layer, options) {
        var padding = resolvePadding(options);
        var w = options.chart.plotWidth - padding.left - padding.right;
        var h = options.chart.plotHeight - padding.top - padding.bottom;
        var shortSide = Math.min(w, h);
        var rad = shortSide / 2;

        if (padding.left == null) {
            padding.left = w / 2 - rad;
        }

        var labelr = rad + options.pieCallouts.distance;
        var centerX = rad + padding.left;
        // var centerY = rad + padding.top;
        var keyFn = function (d) {
            return d.data.x;
        };

        padding.top = padding.top || (h/2) - rad;

        var filteredData = _.filter(data[0].data, function (p) { return p.y; });
        var pie =  d3.layout.pie().value(function (d) { return d.y; }).sort(null);
        var arc = d3.svg.arc().outerRadius(rad).innerRadius(resolveNumber(options.pie.innerRadius, rad));
        layer.attr('transform', 'translate(0,0)');
        var text = layer.selectAll('.pie-callout')
            .data(pie(filteredData), keyFn);

        text.enter().append('text')
            .attr('class', function (d) { return 'pie-callout ' + d.data.x; } );

        text.exit().remove();

        text.attr('transform', function (d) {
            var c = arc.centroid(d);
            var x = c[0];
            var y = c[1];
            var h = Math.sqrt(x*x + y*y);
            var posX = x/h * labelr + rad + padding.left;
            var side = posX > centerX ? 1 : -1; // positive is right side
            var offset = options.pieCallouts.textPadding * side;
            var posY = _.nw.clamp(y/h * labelr + rad + padding.top, 10, options.chart.plotHeight - 20);

            return 'translate(' + (posX + offset) + ',' + (posY) + ')';
        })
        .attr('dy', '.31em')
        .attr('text-anchor', function () {
            var trans = d3.select(this).attr('transform').match(/([\d\.]+)[,\s]([\d\.]+)/);
            var trX = +trans[1];

            return trX > centerX ? 'start' : 'end';
        })
        .text(function (d) {
            return options.pieCallouts.formatter ? options.pieCallouts.formatter(d) : d.data.y + '<br>' + d.data.x;
        });

        text.each(function () {
            var el = d3.select(this);
            var text = el.text();
            var parts = text.split('<br>');
            var longest = _.reduce(parts, function (longest, cur) {
                return longest.length > cur.length ? longest : cur;
            }, '');
            var bounds = _.nw.textBounds(longest, '.callout-line');
            el.text('');
            _.each(parts, function (p, i) {
                el.append('tspan')
                    .attr('class', function (d) { return 'callout-line callout-line-' + (i+1) + ' ' + d.data.x; })
                    .text(p).attr('x', 0).attr('dy', (bounds.height + 3) * i);
            });
        });

        var lines = layer.selectAll('.pie-callout-line').data(pie(filteredData), keyFn);

        lines.enter().append('path')
            .attr('class', function (d) { return 'pie-callout-line ' + d.data.x; })
            .attr('stroke', '#ddd')
            .attr('fill', 'none');

        lines.exit().remove();

        lines.attr('d', function (d) {
            var c = arc.centroid(d);
            var x = c[0];
            var y = c[1];
            var centroidX = x+rad+padding.left;
            var centroidY = y+rad+padding.top;

            var h = Math.sqrt(x*x + y*y);
            var text = options.pieCallouts.formatter ? options.pieCallouts.formatter(d) : d.data.x;
            var bounds = _.nw.textBounds(text, '.callout-line');
            var posX = x/h * labelr + rad + padding.left;
            var sideX = posX > centerX ? 1 : -1; // positive is right side
            var labelPadding = 3;
            var offsetX = (bounds.width + labelPadding + options.pieCallouts.textPadding) * sideX;
            var offsetY = 4;
            var posY = _.nw.clamp(y/h * labelr + rad + padding.top, 10, options.chart.plotHeight - 20);

            // posX = sideX > 0 ? _.nw.clamp(posX, 0, options.chart.plotWidth - bounds.width - options.pieCallouts.textPadding) :
            //     _.nw.clamp(posX, bounds.width + options.pieCallouts.textPadding, options.chart.plotWidth);

            return ['M', (centroidX), ',', (centroidY), ' L', posX, ',', posY + offsetY, ' L', posX + offsetX, ',', posY + offsetY].join('');
        });
    }

    pieCallouts.defaults = defaults;

    Contour.export('pieCallouts', pieCallouts);
})();
;(function () {
    'use strict';
    function resolveNumber(value, ref) { return value > 0 && value < 1 ? value * ref : value; }

    function resolvePadding(options) {
        var w = options.chart.plotWidth;
        var h = options.chart.plotHeight;

        return {
            top: resolveNumber(options.pie.piePadding.top, h),
            bottom: resolveNumber(options.pie.piePadding.bottom, h),
            left: resolveNumber(options.pie.piePadding.left, w),
            right: resolveNumber(options.pie.piePadding.right, w),
        };
    }

    function pieLegend(data, layer, options) {
        var padding = resolvePadding(options);
        var w = options.chart.plotWidth - padding.left - padding.right;
        var h = options.chart.plotHeight - padding.top - padding.bottom;
        var shortSide = Math.min(w, h);
        var rad = shortSide / 2;
        padding.left = padding.left || w / 2 - rad;
        padding.top = padding.top || h / 2 - rad;
        var centerX = rad + padding.left;
        var centerY = rad + padding.top;
        var keyFn = function (d) { return d.data.x; };
        var format = d3.format('.2s');

        var filteredData = _.filter(data[0].data, function (p) { return p.y; });
        var pie =  d3.layout.pie().value(function (d) { return d.y; }).sort(null);
        var arc = d3.svg.arc().outerRadius(rad).innerRadius(resolveNumber(options.pie.innerRadius, rad));

        layer.attr('transform', 'translate(0,0)');

        var text = layer.selectAll('.pie-legend')
            .data(pie(filteredData), keyFn);

        text.enter().append('text')
            .attr('class', function (d) { return 'pie-legend ' + d.data.x; } );

        text.exit().remove();

        text.attr('transform', function (d) {
            var c = arc.centroid(d);
            var posX = Math.round(c[0] + centerX);
            var posY = Math.round(c[1] + centerY);

            return 'translate(' + (posX) + ',' + (posY) + ')';
        })
        .attr('dy', '.31em')
        .attr('text-anchor', 'middle')
        .text(function (d) {
            if (d.endAngle - d.startAngle < options.pieLegend.minAngle) return '';
            return options.pieLegend.formatter.call(this, d, options);
            // return options.pieLegend.formatter.call(this, d) : d.data.x + '<br>' + format(d.data.y);
        });

        // split lines at <br>
        text.each(function () {
            var el = d3.select(this);
            var text = el.text();
            var parts = text.split('<br>');
            var longest = _.reduce(parts, function (longest, cur) {
                return longest.length > cur.length ? longest : cur;
            }, '');
            var bounds = _.nw.textBounds(longest, '.legend-line');
            el.text('');
            _.each(parts, function (p, i) {
                el.append('tspan')
                    .attr('class', function (d) { return 'legend-line legend-line-' + (i+1) + ' ' + d.data.x; })
                    .text(p).attr('x', 0).attr('dy', (bounds.height + 3) * i);
            });
        });


    }

    var formatters = {
        percentage: function (d, options) {
            // show the % that each slice represents from the total
            var ff = d3.format(options.pieLegend.format);
            return ff((d.endAngle-d.startAngle) / (2.0 * Math.PI));
        },

        value: function (d, options) {
            // show only the actual 'y' value
            var ff = d3.format(options.pieLegend.format);
            return ff(d.value);
        },

        xy: function (d, options) {
            // show x and y values on different lines
            var ff = d3.format(options.pieLegend.format);
            return d.data.x + '<br>' + ff(d.data.y);
        }
    };

    pieLegend.defaults = {
        pieLegend: {
            format: '%',

            formatter: function (d, options) {
                var fn = formatters[options.pieLegend.showAs] || formatters.percentage;
                return fn.call(this, d, options);
            },

            minAngle: 0.4,

            showAs: 'percentage' // could be 'percentage' or 'value' or 'xy'
        }
    };

    Contour.export('pieLegend', pieLegend);
})();
;(function () {

    var numberFormat = d3.format(',.0d');
    var defaults = {
        multiTooltip: {

            formatter: function (d) {
                return numberFormat(d.y);
            },

            marker: {
                radius: 5
            }
        }
    };

    function multiTooltip(data, layer, options) {
        var duration = 40;
        var halfBand = this.xScale.rangeBand ? this.xScale.rangeBand() / 2 : 0;
        var _this = this;
        var localData = data;
        var textFormatter = options.multiTooltip.formatter;
        var invert = function (x) {
            var scale = _this._xAxis.scale();
            if (scale.invert) return scale.invert(x);
            var range = scale.range();
            var i = 0;
            while(x > range[i]) i++;
            return _.nw.clampLeft(i-1, 0);
        };

        var line = layer.selectAll('.line-marker').data([null]);
        line.enter().append('line')
            .style('display', 'none')
            .attr('class', 'line-marker')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', options.chart.plotHeight);

        var circles = layer.selectAll('.point-marker').data(data);

        var enter = circles.enter().append('g')
            .attr('class', 'point-marker')
            .style('display', 'none');

        circles.exit().remove();

        enter.append('text')
            .attr('class', 'text')
            .attr('dx', '10px')
            .attr('dy', '.31em');

        enter.append('circle')
            .attr('class', function (d, i) { return 'outside s-' + (i+1); })
            .attr('r', options.multiTooltip.marker.radius + 2)
            .attr('cx', 0)
            .attr('cy', 0);

        enter.append('circle')
            .attr('class', function (d, i) { return 'inside s-' + (i+1); })
            .attr('r', options.multiTooltip.marker.radius)
            .attr('cx', 0)
            .attr('cy', 0);


        var surface = layer.selectAll('.tooltip-sensor').data([null]);
        surface.enter().append('rect')
            .attr('class', 'tooltip-sensor')
            .attr('opacity', 0)
            .attr('width', options.chart.plotWidth)
            .attr('height', options.chart.plotHeight);

        surface
            .on('mousemove', null)
            .on('mouseover', null)
            .on('mouseout', null)

            .on('mousemove', update)
            .on('mouseover', show)
            .on('mouseout', hide);

        function show() {
            layer.selectAll('.point-marker, .line-marker').style('display', function () {
                return null;
            });
        }

        function hide() {
            layer.selectAll('.point-marker, .line-marker').style('display', 'none');
        }

        function update() {
            var bisect = d3.bisector(function (d) {
                return d.x;
            }).left;
            var mouse = d3.mouse(this);
            var x = invert(mouse[0]);
            var y0 = 0;
            var xLine = 0;
            _.each(localData, function (series, index) {
                var i = bisect(series.data, x);
                var d0 = series.data[i - 1];
                var d1 = series.data[i];
                var datum;

                if (i <= 0) {
                    datum = d1;
                    i = 0;
                } else if (x-d0.x > d1.x - x) {
                    datum = d1;
                } else {
                    datum = d0;
                    i = i-1;
                }

                var m = d3.select(circles[0][index]);
                m.transition().duration(duration).ease('linear')
                    .attr('transform', function () {
                        var px = _this.xScale(datum.x) + 0.5 + halfBand;
                        var py = _this.yScale(datum.y + y0) + 0.5;
                        return 'translate(' + px + ',' + py + ')';
                    });

                m.select('text')
                    .text(function () {
                        return textFormatter.call(_this, datum, localData, i );
                    });

                y0 += datum.y;
                xLine = datum.x;
            });

            line.transition().duration(duration).ease('linear')
                .attr('x1', _this.xScale(xLine) + 0.5 + halfBand)
                .attr('x2', _this.xScale(xLine) + 0.5 + halfBand);
        }
    }

    multiTooltip.defaults = defaults;

    Contour.export('multiTooltip', multiTooltip);

})();
;(function () {
    'use strict';

    function Watermark(data, layer, options) {
        var w = options.chart.plotWidth;
        var bounds = _.nw.textBounds(data, '.watermark-text');
        var ds = _.isString(data) ? [null] : [];
        var text = layer.selectAll('.watermark-text')
            .data(ds);

        text.enter().append('text')
                .attr('class', 'watermark-text')
                .attr('x', w/2)
                .attr('y', 100)
                .attr('opacity', 0.05)
                .attr('text-anchor', 'middle')
                .text(data);

        text.text(data);

        text.exit()
            .transition().duration(1500)
            .attr('opacity', 0)
            .remove();
    }

    /**
    *
    * ### Example:
    *
    *     new Contour({el: '.chart'})
    *           .cartesian()
    *           .watermark('Draw Me')
    *           .render();
    *
    */
    Contour.export('watermark', Watermark);

})();
