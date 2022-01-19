(function ($) { $.belowthefold = function (element, settings) { var fold = $(window).height() + $(window).scrollTop(); return fold <= $(element).offset().top - settings.threshold; }; $.abovethetop = function (element, settings) { var top = $(window).scrollTop(); return top >= $(element).offset().top + $(element).height() - settings.threshold; }; $.rightofscreen = function (element, settings) { var fold = $(window).width() + $(window).scrollLeft(); return fold <= $(element).offset().left - settings.threshold; }; $.leftofscreen = function (element, settings) { var left = $(window).scrollLeft(); return left >= $(element).offset().left + $(element).width() - settings.threshold; }; $.inviewport = function (element, settings) { return !$.rightofscreen(element, settings) && !$.leftofscreen(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings); }; $.extend($.expr[':'], { "below-the-fold": function (a, i, m) { return $.belowthefold(a, { threshold: 0 }); }, "above-the-top": function (a, i, m) { return $.abovethetop(a, { threshold: 0 }); }, "left-of-screen": function (a, i, m) { return $.leftofscreen(a, { threshold: 0 }); }, "right-of-screen": function (a, i, m) { return $.rightofscreen(a, { threshold: 0 }); }, "in-viewport": function (a, i, m) { return $.inviewport(a, { threshold: 0 }); } }); })(jQuery);

$(function () {
    function do_replace() {
        var element = $('[name="city"]:in-viewport:visible');

        var attr_name = element.attr('name');
        var attr_class = element.attr('class');
        var attr_id = element.attr('id');
        var placeholder = element.attr('placeholder');
        var value = element.val();

        if (element != null) {
            if ($('select[name="country_id"]:in-viewport:visible').val() == 175 && $('select[name="zone_id"]:in-viewport:visible').val()) {
                $.post('index.php?route=extension/module/cargus/localitati&judet=' + $('select[name="zone_id"]:in-viewport:visible').val() + '&val=' + value, function (data) {
                    element.replaceWith('<select name="' + attr_name + '" placeholder="' + placeholder + '" class="' + attr_class + '" id="' + attr_id + '">' + data + '</select>');
                });
            } else {
                element.replaceWith('<input type="text" name="' + attr_name + '" placeholder="' + placeholder + '" class="' + attr_class + '" id="' + attr_id + '" value="" />');
            }
        }
    }

    var done = false;
    $(document).ajaxComplete(function (event, request, settings) {
        if (!done) {
            do_replace();
            done = true;
        }
    });

    $(document).on('change', 'select[name="country_id"]:in-viewport:visible', function () {
        var done = false;
        $(document).ajaxComplete(function (event, request, settings) {
            if (!done) {
                do_replace();
                done = true;
            }
        });
    });

    $(document).on('change', 'select[name="zone_id"]:in-viewport:visible', function () {
        do_replace();
    });
});