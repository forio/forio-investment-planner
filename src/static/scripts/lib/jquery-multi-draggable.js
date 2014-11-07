(function ($) {
    'use strict';

    var totalWidth;

    var addIcon = function ($item) {
        var $icon = $('<i>').addClass('dragger');
        $item.append($icon);

        return $icon;
    }

    var getNeigbor = function ($item) {
        var $cash = $('.draggable').last();

        if ($cash.width() > 2) {
            return $cash;
        }
        return $item.next();
    }

    var normalize = function  (opt) {
        if (opt.newValue < 0.01) {
            opt.newNeighborValue += opt.newValue;
            opt.newValue = 0;
        }

        if (opt.newNeighborValue < 0) {
            opt.newValue += opt.newNeighborValue;
            opt.newNeighborValue = 0;
        }

        opt.item.data('value', opt.newValue);
        opt.neighbor.data('value', opt.newNeighborValue );
        opt.item.trigger('slideUpdate');
    }

    $.fn.multiDraggable = function () {

        var that = this;

        var widthSet = _.after(this.length, function () {

            that.each( function () {

                var $item = $(this);

                var $icon =  addIcon($item);

                var currentX;

                $icon.on('mousedown', function (e) {
                    var minX = $item.offset().left;

                    var $neighbor = getNeigbor($item);
                    if ($neighbor.length) {
                        var maxX = $neighbor.width() + $item.offset().left + $item.width();
                    } 
                    currentX = e.pageX;

                    var neighborWidth = $neighbor.width();

                    var newWidth;
                    var newValue;
                    var newValueAdjust;
                    var newNeighborValue;
                    var newNeighborWidth;
                    $(document).on('mousemove', function (e) {
                        if (e.pageX < maxX && e.pageX > minX) {
                            newWidth = e.pageX - minX;
                            $item.width(newWidth);
                            newNeighborWidth = neighborWidth - ( e.pageX - currentX );
                            $neighbor.width(newNeighborWidth);
                            newValue = newWidth / totalWidth;
                            newNeighborValue = newNeighborWidth / totalWidth;
                            normalize({
                                newValue: newValue, 
                                newNeighborValue: newNeighborValue,
                                item: $item,
                                neighbor: $neighbor
                            });
                        }
                    });

                    $(document).one('mouseup', function () {
                        $(document).off('mousemove');
                    });
                })

            })



        }, this);

        return this.each(function () {

            var $item = $(this);
            totalWidth = $item.parent().width();

            var width = +$item.data('value') * totalWidth;

            $item.width(width);

            widthSet();
        });
    };

})(window.$);
