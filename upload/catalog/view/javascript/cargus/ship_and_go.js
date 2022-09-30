function addScriptOrStyle(path, callback) {
    var script = document.createElement("script");
    script.type = 'text/javascript';
    script.src = path;
    script.onload = callback;
    document.head.appendChild(script);
};

addScriptOrStyle('/catalog/view/javascript/cargus/widget.js?v=1', function() {
});

function renderMap() {
    // Setup map
    var widget = new Widget({
        key: 'online',
        initialPosition: {
            latitude: '44.435701',
            longitude: '26.101646'
        },
        selectedLocationId: null,
        mapSelector: 'map',
        containerSelector: '#widget',
        width: '100%',
        height: '600px',
        zoomEnabled: 'true',
        defaultZoomLevel: '13',
        pinIcon: 'null',
        lang: 'EN',
        apiUrl: 'https://app.urgentcargus.ro/map',
        showChooseButton: true,
        showOnlyShipGo: true,
        showOnlyApm: true,
        style: {
            font: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'white',
            textColor: 'black',
            spinnerColor: '#F1A832',
            sidebar: {
                buttonTextColor: 'white',
                buttonTextHoverColor: 'white',
                buttonBackgroundColor: '#F1A832',
                buttonBackgroundHoverColor: 'darkorange',

                pudoItemTextColor: '#666',
                pudoItemBackgroundColor: '#eee',
                pudoItemTextHoverColor: '#666',
                pudoItemBackgroundHoverColor: 'lightgray',

                pudoItemSelectedTextColor: 'white',
                pudoItemSelectedBackgroundColor: '#F1A832',
                pudoItemSelectedButtonTextColor: '#4d4d4d',
                pudoItemSelectedButtonBackgroundColor: 'white',
                pudoItemSelectedButtonTextHoverColor: 'white',
                pudoItemSelectedButtonBackgroundHoverColor: 'darkorange'
            },
            popup: {
                backgroundColor: 'white',
                mainTextColor: '#4d4d4d',
                detailsTextColor: '#666',
                buttonTextColor: 'white',
                buttonBackgroundColor: '#F1A832',
                buttonTextHoverColor: 'white',
                buttonBackgroundHoverColor: 'darkorange',
            }
        }
    });
    widget.init();

    $( '#shipgomap-modal' ).on( 'shown.bs.modal', function () {
        if (Widget.instance.map) {
            Widget.instance.map.invalidateSize(true);
        }
    } );

    widget.onChanged = function (location) {
        // Location selection changed
        var spinner = $('.spinner-border').removeClass('d-none');

        spinner.removeClass('d-none');

        $.ajax({
            type: "POST",
            url: "index.php?route=extension/module/cargus_ship/location",
            cache: true,
            data: { location_id: location.Id },
            dataType: "json",
            success: function(data){
                checkAndRenderContinue(data, location);
                spinner.addClass('d-none');
            },
            error: function(data) {
                checkAndRenderContinue(data, location);
                spinner.addClass('d-none');
            }
        });

        if (window._QuickCheckoutData !== undefined && window['_QuickCheckoutData'].order_data.shipping_country_id == 175) {
            window['_QuickCheckoutData'].order_data.custom_field.pudo_location_id = location.Id;
        }
    };

}

var translations = {
    noPaymentsAvailableOnPudoLocation: 'In locatia aleasa nu este disponibila nicio modalitate de plata!',
    paymentsAvailableOnPudoLocation: 'In locatia aleasa sunt disponibile urmatoarele modalitati de plata: ',
    card_payment_mandatory: "Nu se poate plati ramburs, plata trebuie efectuata cu cardul la finalizarea comenzii!",
    shipAndGoPayments: {
        no_payment_available: "Nu permite plata ramburs",
        card_payment_available: "Card",
        online_payment_available: "Link de plata a rambursului pe telefon",
        cash_payment_available: "Numerar",
    }
}

createAlertHTML = function (location) {
    var locationPaymentsString = 'Locatie aleasa : <b>' + location.Name + '</b><br/>';

    return locationPaymentsString;
}

function checkAndRenderContinue(data, location) {
    var continueButton      = $('button.continue:visible');
    var continueButtonExtra = $('button.continue-extra');
    var locationInfoAlert = $('.location-alert');
    var locationErrorAlert = $('.location-error');

    if (!data.responseText.includes('ERROR')) {
        locationInfoAlert.html(createAlertHTML(location));
        locationInfoAlert.removeClass('d-none');

        widget.selectedLocation = location;

        continueButton.prop('disabled', false);

        continueButtonExtra.removeClass('d-none');
        locationErrorAlert.addClass('d-none');
        $("[name='has_cash_on_delivery']").val(location.ServiceCOD ? 1 : 0);
        toggleShipingMethodSave(1);

        $('#shipgomap-modal').modal('hide');
    } else {
        continueButton.prop('disabled', true);
        locationErrorAlert.removeClass('d-none');
    }
}
function enableDisablePaymentMethod(disabled = true){
    $("[name='payment_method']").each(function (){
        if($(this).prop('value') == "cod"){
            if(disabled){
                $(this).attr('disabled','disabled');
                $(this).prop('checked',false);
            }else{
                $(this).removeAttr('disabled');
            }
        }
    });
}
function checkPaymentMethod(){
    if (checkShipAndGoValue($("[name='shipping_method']:checked").val()) && $("[name='has_cash_on_delivery']").val() == 0) {
        // disable Cash on Delivery
        enableDisablePaymentMethod();
    } else {
        enableDisablePaymentMethod(false);
    }
}
function setupShippingMap(){
    // we need to inject map dom element
    var mapDom = '<div id="map_container" style="position: relative;">';

    mapDom += `<div class="modal" id="shipgomap-modal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content cargus-modal-content">
                <div class="cargus-modal-header">
                    <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close">
                        
                    </button>
                </div>
                <div class="modal-body">`;

    mapDom += '<div class="ship-and-go-map w-100 mb-3"><div id="widget"></div></div>';

    mapDom += `<div class="alert alert-warning d-none location-alert mt-2 mr-2" role="alert"></div>
                    <div class="alert alert-danger d-none location-error mt-2 mr-2" role="alert">
                        A aparut o problema la salvarea locatiei. Incercati din nou!
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    mapDom += `<div class="position-relative mx-auto">
        <button type="button" class="btn btn-primary position-relative start-50 translate-middle-x"
                data-toggle="modal" data-target="#shipgomap-modal">
            Alege cel mai apropiat Ship&Go!
        </button>
    </div>`;

    mapDom += '<div class="alert alert-warning d-none location-alert mt-2 mr-2" role="alert"></div>';
    mapDom += '<div class="alert alert-danger d-none location-error mt-2 mr-2" role="alert">';
    mapDom += 'A aparut o problema la salvarea locatiei. Incercati din nou!';
    mapDom += '</div>';
    mapDom += '<input type="hidden" name="has_cash_on_delivery" value="">';
    //mapDom += 'Continue';
    mapDom += '</button>';
    mapDom += '</div>';
    var isMapNedeed = false;
    $("[name='shipping_method']").each(function (){
        if(isSippingRadioItem($(this))){
            $(this).closest("div").after(mapDom);
            isMapNedeed = true;
        }
    });
    return isMapNedeed;
}
function checkShipAndGoValue(val) {
    return 'cargus_ship_and_go.ship_and_go' == val;
}
function isSippingRadioItem(elm) {
    if (checkShipAndGoValue(elm.attr('value'))) {
        return true;
    }
    return false;
}
function toggleShipingMethodSave(show =  1) {
    if (show) {
        $("#button-shipping-method").removeAttr('disabled');
    } else {
        $("#button-shipping-method").attr('disabled','disabled');
    }
}
function attachActionOnRadio(){
    $("[name='shipping_method']").each(function (){
        $(this).click(
            function(){
                if (isSippingRadioItem($(this))) {
                    $("#map_container").show();
                    toggleShipingMethodSave(0);

                } else {
                    $("#map_container").hide();
                    hideLocationDiv();
                    toggleShipingMethodSave();
                    $("[name='has_cash_on_delivery']").val('');
                }
            }
        );
    });
}
function showMapBasedOnShipingRadioChecked() {
    $("[name='shipping_method']").each(function (){
        if (isSippingRadioItem($(this)) && $(this).prop('checked')) {
            $("#map_container").show();
            toggleShipingMethodSave(0);
        }
    });
}

function cargusCheckShipping(){
    var isMapNedeed = setupShippingMap();
    if (isMapNedeed) {
        $("#map_container").hide();
        renderMap();
        attachActionOnRadio();
        showMapBasedOnShipingRadioChecked();
    }
}
