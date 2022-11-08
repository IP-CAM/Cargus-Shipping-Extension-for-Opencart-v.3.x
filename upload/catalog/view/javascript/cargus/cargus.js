(function ($) { $.belowthefold = function (element, settings) { var fold = $(window).height() + $(window).scrollTop(); return fold <= $(element).offset().top - settings.threshold; }; $.abovethetop = function (element, settings) { var top = $(window).scrollTop(); return top >= $(element).offset().top + $(element).height() - settings.threshold; }; $.rightofscreen = function (element, settings) { var fold = $(window).width() + $(window).scrollLeft(); return fold <= $(element).offset().left - settings.threshold; }; $.leftofscreen = function (element, settings) { var left = $(window).scrollLeft(); return left >= $(element).offset().left + $(element).width() - settings.threshold; }; $.inviewport = function (element, settings) { return !$.rightofscreen(element, settings) && !$.leftofscreen(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings); }; $.extend($.expr[':'], { "below-the-fold": function (a, i, m) { return $.belowthefold(a, { threshold: 0 }); }, "above-the-top": function (a, i, m) { return $.abovethetop(a, { threshold: 0 }); }, "left-of-screen": function (a, i, m) { return $.leftofscreen(a, { threshold: 0 }); }, "right-of-screen": function (a, i, m) { return $.rightofscreen(a, { threshold: 0 }); }, "in-viewport": function (a, i, m) { return $.inviewport(a, { threshold: 0 }); } }); })(jQuery);

$(function () {
    function do_replace() {
        if (window._QuickCheckoutData !== undefined && window['_QuickCheckoutData'].order_data.shipping_country_id == 175) {
            $('#input-payment-city').show();
            $('#input-shipping-city').show();
        }
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
            }
            if (window._QuickCheckoutData !== undefined && window['_QuickCheckoutData'].order_data.shipping_country_id == 175 && $('select[id="input-payment-zone"]:in-viewport:visible').val()) {
                $('#input-payment-zoneclone').remove();

                $.post('index.php?route=extension/module/cargus/localitati&judet=' + $('select[id="input-payment-zone"]:in-viewport:visible').val() + '&val=' + value, function (data) {
                    $('#input-payment-city').hide();
                    $('#input-payment-city').parent().append('<select name="' + attr_name + 'clone" placeholder="' + placeholder + '" class="' + attr_class + '" id="input-payment-zoneclone">' + data + '</select>');

                    $('#input-payment-zoneclone').on('change', function(){
                        if (window['_QuickCheckoutData'].same_address) {
                            window['_QuickCheckoutData'].order_data.payment_city = $('#input-payment-zoneclone option:selected').text();
                            window['_QuickCheckoutData'].order_data.shipping_city = $('#input-payment-zoneclone option:selected').text();
                        } else {
                            window['_QuickCheckoutData'].order_data.payment_city = $('#input-payment-zoneclone option:selected').text();
                        }
                    });
                    $('#input-payment-zoneclone').trigger('change');
                });
            }
            if (window._QuickCheckoutData !== undefined && window['_QuickCheckoutData'].order_data.shipping_country_id == 175 && $('select[id="input-shipping-zone"]:in-viewport:visible').val()) {
                $('#input-shipping-zoneclone').remove();

                $.post('index.php?route=extension/module/cargus/localitati&judet=' + $('select[id="input-shipping-zone"]:in-viewport:visible').val() + '&val=' + value, function (data) {
                    $('#input-shipping-city').hide();
                    $('#input-shipping-city').parent().append('<select name="' + attr_name + 'clone" placeholder="' + placeholder + '" class="' + attr_class + '" id="input-shipping-zoneclone">' + data + '</select>');

                    $('#input-shipping-zoneclone').on('change', function() {
                        if (window['_QuickCheckoutData'].same_address) {
                            window['_QuickCheckoutData'].order_data.payment_city = $('#input-shipping-zoneclone option:selected').text();
                            window['_QuickCheckoutData'].order_data.shipping_city = $('#input-shipping-zoneclone option:selected').text();
                        } else {
                            window['_QuickCheckoutData'].order_data.shipping_city = $('#input-shipping-zoneclone option:selected').text();
                        }
                    });
                    $('#input-shipping-zoneclone').trigger('change');
                });
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

    $.cargusGuestAddressForm = function() {

        if (window._QuickCheckoutData !== undefined) {
            //ignore journal3 theme
            return true;
        }

        const company = $("#input-payment-company").parent();

        $("#input-payment-city").parent().insertAfter(company);
        $("#input-payment-zone").parent().insertAfter(company);

        $("#input-payment-address-1").parent().hide();

        const companyShipping = $("#input-shipping-company").parent().parent();

        $("#input-shipping-city").parent().parent().insertAfter(companyShipping);
        $("#input-shipping-zone").parent().parent().insertAfter(companyShipping);

        $("#input-shipping-address-1").parent().parent().hide();

        //trim the inputs
        $("#input-payment-custom-field9001").val( $("#input-payment-custom-field9001").val().trim() );
        $("#input-payment-custom-field9002").val( $("#input-payment-custom-field9002").val().trim() );

        if ($("#input-shipping-custom-field9001").length > 0) {
            $("#input-shipping-custom-field9001").val($("#input-shipping-custom-field9001").val().trim());
            $("#input-shipping-custom-field9002").val($("#input-shipping-custom-field9002").val().trim());
        }

        addScriptOrStyle('/catalog/view/javascript/cargus/jquery-ui.min.js', function() {

            jQuery.uniqueSort = jQuery.uniqueSort ? jQuery.uniqueSort : jQuery.unique;

            function getStreets(request, response) {
                console.log('getStreets');

                let streets = [];

                //check required field city
                if (
                    $("select#input-payment-city").length > 0 &&
                    $("select#input-payment-city").find(':selected').data("cid") !== undefined
                ) {
                    streets = [ "test1", "test2" ];

                    let city = $("select#input-payment-city").find(':selected').data("cid");

                    console.log('city=', city);

                    $.ajax({
                        url: "",
                        dataType: "json",
                        success: function (data) {

                        },

                    });
                }

                return streets;
            }

            $("#input-payment-custom-field9001").autocomplete({
                source: function(request, response) {
                    response( getStreets() );
                }
            });

            if ($("#input-shipping-custom-field9001").length > 0) {
                $("#input-shipping-custom-field9001").autocomplete({
                    source: function(request, response) {
                        response( getStreets() );
                    }
                });
            }

            function updateAddress() {
                const str = $("#input-payment-custom-field9001").val();
                const strNr = $("#input-payment-custom-field9002").val();

                $("#input-payment-address-1").val(str + ' ' + strNr);

                if ($("#input-shipping-custom-field9001").length > 0) {
                    const str2 = $("#input-shipping-custom-field9001").val();
                    const strNr2 = $("#input-shipping-custom-field9002").val();

                    $("#input-shipping-address-1").val(str2 + ' ' + strNr2);
                }

                console.log('updateAddress');
            }

            $("#input-payment-custom-field9001").on('keyup', function() {
                updateAddress();
            });
            $("#input-payment-custom-field9002").on('keyup', function() {
                updateAddress();
            });
            $("#input-shipping-custom-field9001").on('keyup', function() {
                updateAddress();
            });
            $("#input-shipping-custom-field9002").on('keyup', function() {
                updateAddress();
            });
        });
    };

});
