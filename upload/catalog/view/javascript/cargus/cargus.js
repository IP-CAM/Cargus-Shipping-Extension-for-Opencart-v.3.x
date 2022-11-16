(function ($) { $.belowthefold = function (element, settings) { var fold = $(window).height() + $(window).scrollTop(); return fold <= $(element).offset().top - settings.threshold; }; $.abovethetop = function (element, settings) { var top = $(window).scrollTop(); return top >= $(element).offset().top + $(element).height() - settings.threshold; }; $.rightofscreen = function (element, settings) { var fold = $(window).width() + $(window).scrollLeft(); return fold <= $(element).offset().left - settings.threshold; }; $.leftofscreen = function (element, settings) { var left = $(window).scrollLeft(); return left >= $(element).offset().left + $(element).width() - settings.threshold; }; $.inviewport = function (element, settings) { return !$.rightofscreen(element, settings) && !$.leftofscreen(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings); }; $.extend($.expr[':'], { "below-the-fold": function (a, i, m) { return $.belowthefold(a, { threshold: 0 }); }, "above-the-top": function (a, i, m) { return $.abovethetop(a, { threshold: 0 }); }, "left-of-screen": function (a, i, m) { return $.leftofscreen(a, { threshold: 0 }); }, "right-of-screen": function (a, i, m) { return $.rightofscreen(a, { threshold: 0 }); }, "in-viewport": function (a, i, m) { return $.inviewport(a, { threshold: 0 }); } }); })(jQuery);

$(function () {
    addScriptOrStyle('/catalog/view/javascript/cargus/jquery-ui.min.js', function() {
        jQuery.uniqueSort = jQuery.uniqueSort ? jQuery.uniqueSort : jQuery.unique;
    });

    async function getCities(input) {
        //check required field state
        if (
            $(input).length > 0 &&
            $(input).find(':selected').val().length >= 2
        ) {
            let state = $(input).find(':selected').val();

            //get json data
            let result = await $.getJsonData('index.php?route=extension/module/cargus/cities', {'state': state}, 'POST');

            if (result !== false) {
                return result;
            }
        }

        return [];
    }

    async function filterCities(request, input) {
        let data = await getCities(input);

        let search = request.term.toUpperCase();

        let result = [];
        let i = 0;

        $.each(data, function (key, obj) {
            let name = obj.Name.toUpperCase();

            let $extraKm = (!obj.ExtraKm ? 0 : obj.ExtraKm);
            let $km = (obj.InNetwork ? 0 : $extraKm);

            let extra = {
                'zip': obj.PostalCode,
                'cid': obj.LocalityId,
                'km': $km
            };

            if (name.indexOf(search) != -1) {
                i++;

                result.push({
                    label: obj.Name, // Label for Display
                    value: obj.Name, // Value
                    extra: extra
                });
            }

            if (i > 9) {
                return false;
            }
        });

        return result;
    }

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
                //autocomplete
                element.autocomplete({
                    delay: 350,
                    minLength: 1,
                    source: async function(request, response) {
                        let result = await filterCities(request, 'select[name="zone_id"]:in-viewport:visible');

                        response(result);
                    },
                    select: function(event, ui) {
                        element.data('cid', ui.item.extra.cid);
                        element.data('zip', ui.item.extra.zip);
                        element.attr('km', ui.item.extra.km);
                        element.trigger('change');
                    }
                });

                return true;
            }

            if (window._QuickCheckoutData !== undefined && window['_QuickCheckoutData'].order_data.shipping_country_id == 175 && $('select[id="input-payment-zone"]:in-viewport:visible').val()) {
                $('#input-payment-city').autocomplete({
                    delay: 350,
                    minLength: 1,
                    source: async function(request, response) {
                        let result = await filterCities(request, 'select[id="input-payment-zone"]:in-viewport:visible');

                        response(result);
                    },
                    select: function(event, ui) {
                        $('#input-payment-city').val(ui.item.value);
                        if (window['_QuickCheckoutData'].same_address) {
                            window['_QuickCheckoutData'].order_data.payment_city = $('#input-payment-city').val();
                            window['_QuickCheckoutData'].order_data.shipping_city = $('#input-payment-city').val();
                        } else {
                            window['_QuickCheckoutData'].order_data.payment_city = $('#input-payment-city').val();
                        }
                    }
                });
            }

            if (window._QuickCheckoutData !== undefined && window['_QuickCheckoutData'].order_data.shipping_country_id == 175 && $('select[id="input-shipping-zone"]:in-viewport:visible').val()) {
                $('#input-shipping-city').autocomplete({
                    delay: 350,
                    minLength: 1,
                    source: async function(request, response) {
                        let result = await filterCities(request, 'select[id="input-shipping-zone"]:in-viewport:visible');

                        response(result);
                    },
                    select: function(event, ui) {
                        $('#input-shipping-city').val(ui.item.value);
                        if (window['_QuickCheckoutData'].same_address) {
                            window['_QuickCheckoutData'].order_data.payment_city = $('#input-shipping-city').val();
                            window['_QuickCheckoutData'].order_data.shipping_city = $('#input-shipping-city').val();
                        } else {
                            window['_QuickCheckoutData'].order_data.shipping_city = $('#input-shipping-city').val();
                        }
                    }
                });
            }
        }

        return false;
    }

    $(document).ajaxComplete(function (event, request, settings) {
        setTimeout(function() {
            do_replace();
        }, 650);
    });

    $(document).on('keypress', 'input[name="city"]:in-viewport:visible', function() {
        if ($(this).data('ui-autocomplete') === undefined) {
            do_replace();
            let that = $(this);

            setTimeout(function(){
                if (that.data('ui-autocomplete') !== undefined) {
                    that.autocomplete("search");
                }
            }, 500);
        }
    });

    $(document).on('change', 'select[name="country_id"]:in-viewport:visible', function () {
        var done = false;
        $(document).ajaxComplete(function (event, request, settings) {
            if (!done) {
                done = do_replace();
            }
        });
    });

    $(document).on('change', 'select[name="zone_id"]:in-viewport:visible', function () {
        do_replace();
    });


    $.jsonToFormData = function(item) {
        let form_data = new FormData();

        Object.entries(item).forEach(([key, value]) => {
            form_data.append(key, value);
        });

        return form_data;
    };

    $.getJsonData = async function(url, data = {}, method = 'GET') {
        let ct = 'application/json';
        let headers = {
            'Content-Type': ct
        };

        let body = JSON.stringify(data);
        if (method === 'POST') {
            ct = 'multipart/form-data';
            body = $.jsonToFormData(data);
            headers = {};
        }

        const response = await fetch(url, {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-store',
            credentials: 'same-origin',
            headers: headers,
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer',
            body: body
        });

        if (!response.ok) {
            console.error('getJsonData failed: ', response);
            return false;
        }

        try {
            const text = await response.text();
            const data = JSON.parse(text);

            return data;
        } catch (err) {
            console.error('getJsonData error: ', err);
        }
        return false;
    };

    $.getJsonDataFallback = async function(url1, url2, data1 = {}, data2 = {}, method1 = 'GET', method2 = 'GET') {
        //try url1
        let result = $.getJsonData(url1, data1, method1);

        //if failed, fallback to url2
        if (result === false) {
            result = $.getJsonData(url2, data2, method2);
        }

        return result;
    };

    $.cargusGuestAddressForm = function() {

        if (window._QuickCheckoutData !== undefined) {
            //ignore journal3 theme
            return true;
        }

        if ($("#input-payment-company").parent().parent().hasClass('form-group')) {
            const company = $("#input-payment-company").parent().parent();

            $("#input-payment-city").parent().parent().insertAfter(company);
            $("#input-payment-zone").parent().parent().insertAfter(company);

            $("#input-payment-address-1").parent().parent().hide();
        } else {
            const company = $("#input-payment-company").parent();

            $("#input-payment-city").parent().insertAfter(company);
            $("#input-payment-zone").parent().insertAfter(company);

            $("#input-payment-address-1").parent().hide();
        }

        const companyShipping = $("#input-shipping-company").parent().parent();

        $("#input-shipping-city").parent().parent().insertAfter(companyShipping);
        $("#input-shipping-zone").parent().parent().insertAfter(companyShipping);

        $("#input-shipping-address-1").parent().parent().hide();

        const companyAccount = $("#input-company").parent().parent();

        $("#input-city").parent().parent().insertAfter(companyAccount);
        $("#input-zone").parent().parent().insertAfter(companyAccount);

        $("#input-address-1").parent().parent().hide();


        //trim the inputs
        if ($("#input-payment-custom-field9001").length > 0) {
            $("#input-payment-custom-field9001").val($("#input-payment-custom-field9001").val().trim());
            $("#input-payment-custom-field9002").val($("#input-payment-custom-field9002").val().trim());
        }

        if ($("#input-shipping-custom-field9001").length > 0) {
            $("#input-shipping-custom-field9001").val($("#input-shipping-custom-field9001").val().trim());
            $("#input-shipping-custom-field9002").val($("#input-shipping-custom-field9002").val().trim());
        }

        if ($("#input-custom-field9001").length > 0) {
            $("#input-custom-field9001").val($("#input-custom-field9001").val().trim());
            $("#input-custom-field9002").val($("#input-custom-field9002").val().trim());
        }


        $(document).on('change', 'input[name="city"]:in-viewport:visible', function() {
            let zip = $(this).data("zip");


            if (zip !== undefined && zip.length == 6) {
                $('input[name="postcode"]:in-viewport:visible').val(zip);
            } else {
                $('input[name="postcode"]:in-viewport:visible').val("");
            }
        });


        //addScriptOrStyle('/catalog/view/javascript/cargus/jquery-ui.min.js', function() {

            // jQuery.uniqueSort = jQuery.uniqueSort ? jQuery.uniqueSort : jQuery.unique;

            async function getStreets(input) {
                //check required field city
                if (
                    $(input).data("cid") !== undefined &&
                    $(input).data("zip").length != 6
                ) {
                    let city = $(input).data("cid");

                    //get json data
                    let result = await $.getJsonData('index.php?route=extension/module/cargus/streets', {'city': city}, 'POST');

                    if (result !== false) {
                        return result;
                    }
                }

                return [];
            }

            async function filterStreets(request, input, strNr = null) {
                let data = await getStreets(input);

                let search = request.term.toUpperCase();
                let searchNr = 0;

                if (strNr != null) {
                    searchNr = parseInt(search);
                    search = $(strNr).val().toUpperCase().trim();
                }

                let result = [];
                let i = 0;

                $.each(data, function (key, obj) {
                    let name = obj.Name.toUpperCase();

                    let extra = null;

                    if (obj.PostalNumbers.length == 1) {
                        extra = obj.PostalNumbers[0].PostalCode;
                    }

                    if (name.indexOf(search) != -1) {
                        if (strNr === null) {
                            i++;

                            result.push({
                                label: obj.Name, // Label for Display
                                value: obj.Name, // Value
                                extra: extra
                            });
                        } else {
                            $.each(obj.PostalNumbers, function(j, objStr) {
                                if (
                                    (
                                        (parseInt(objStr.FromNo) <= searchNr && searchNr <= parseInt(objStr.ToNo)) ||
                                        (parseInt(objStr.FromNo) == parseInt(objStr.ToNo))
                                    ) &&
                                    objStr.PostalCode.length == 6
                                ) {
                                    result.push({
                                        label: obj.Name, // Label for Display
                                        value: obj.Name, // Value
                                        extra: objStr.PostalCode
                                    });

                                    i = 10;

                                    return false;
                                }
                            });
                        }
                    }

                    if (i > 9) {
                        return false;
                    }
                });

                return result;
            }

            $(document).on('keyup keypress', '[name="custom_field[address][9001]"]:in-viewport:visible', function(e) {
                if ($(this).data('ui-autocomplete') === undefined) {
                    $(this).autocomplete({
                        delay: 350,
                        minLength: 2,
                        source: async function(request, response) {
                            let result = await filterStreets(request, 'input[name="city"]:in-viewport:visible');

                            response(result);
                        },
                        select: function(event, ui) {
                            if (ui.item.extra != null) {
                                $('input[name="postcode"]:in-viewport:visible').val(ui.item.extra);
                            } else {
                                $('input[name="postcode"]:in-viewport:visible').val("");
                            }
                        }
                    });

                    $(this).autocomplete("search");
                }
            });

            $(document).on('blur', '[name="custom_field[address][9002]"]:in-viewport:visible', async function(){
                if ($('input[name="city"]:in-viewport:visible').data('zip') !== undefined &&
                    $('input[name="city"]:in-viewport:visible').data('zip').length == 6
                ) {
                    //city has postal code, no need for more searches
                    return true;
                }

                let strNr = $(this).val();

                let result = await filterStreets({'term': strNr}, 'input[name="city"]:in-viewport:visible', '[name="custom_field[address][9001]"]:in-viewport:visible');

                if (result[0] !== undefined && result[0].extra != null) {
                    $('input[name="postcode"]:in-viewport:visible').val(result[0].extra);
                } else {
                    $('input[name="postcode"]:in-viewport:visible').val("");
                }
            });


            function updateAddress() {
                const str = $("#input-payment-custom-field9001").val();
                const strNr = $("#input-payment-custom-field9002").val();

                $("#input-payment-address-1").val(str + ', nr. ' + strNr);

                if ($("#input-shipping-custom-field9001").length > 0) {
                    const str2 = $("#input-shipping-custom-field9001").val();
                    const strNr2 = $("#input-shipping-custom-field9002").val();

                    $("#input-shipping-address-1").val(str2 + ', nr. ' + strNr2);
                }

                if ($("#input-custom-field9001").length > 0) {
                    const str2 = $("#input-custom-field9001").val();
                    const strNr2 = $("#input-custom-field9002").val();

                    $("#input-address-1").val(str2 + ', nr. ' + strNr2);
                }
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
            $("#input-custom-field9001").on('keyup', function() {
                updateAddress();
            });
            $("#input-custom-field9002").on('keyup', function() {
                updateAddress();
            });
        //});
    };

});
