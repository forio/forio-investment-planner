(function ($) {
    'use strict';

    var totalWidth;

    var addIcon = function ($item) {
        var $icon = $('<i>').addClass('dragger');
        $item.append($icon);

        return $icon;
    }

    var normalize = function  (opt) {
        if (opt.newValue < 0.0015) {
            opt.newNeighborValue += opt.newValue;
            opt.newValue = 0;
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

                    var $neighbor = $item.next();
                    if ($neighbor.length) {
                        var maxX = $neighbor.width() + $neighbor.offset().left;
                    }
                    currentX = e.pageX;

                    var newWidth;
                    var newValue;
                    var newValueAdjust;
                    var newNeighborValue;
                    var newNeighborWidth;
                    $(document).on('mousemove', function (e) {
                        if (e.pageX < maxX && e.pageX > minX) {
                            newWidth = e.pageX - minX;
                            $item.width(newWidth);
                            newNeighborWidth = maxX - e.pageX;
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
