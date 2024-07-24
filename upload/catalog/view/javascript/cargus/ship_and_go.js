// ###############
var assets_path;
var DEFAULT_COORDINATES;
var KEY_MAPPING_VALUES;
var data_endpoint;
// ###############
KEY_MAPPING_VALUES = false;
assets_path = 'catalog/view/javascript/cargus/assets/icons';
DEFAULT_COORDINATES = {
    latitude: 44.442137062756885,
    longitude: 26.09464970813823,
};

data_endpoint = "index.php?route=extension/module/cargus_ship/getPudoPoints";

function closeModal() {
    var modal = document.getElementById("shipgomap-modal");
    if (modal) {
        modal.style.display = "none";
    }
    // Check if the element exists
    if (modal) {
        // Clear everything inside the modal
        modal.innerHTML = "";
    }
    return true;
}


function handleLocationChange(location) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "index.php?route=extension/module/cargus_ship/location", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const response = JSON.parse(xhr.responseText);
        }
    };
    const data = "location_id=" + encodeURIComponent(location.Id);
    xhr.send(data);

    if (window._QuickCheckoutData !== undefined && window._QuickCheckoutData.order_data.shipping_country_id == 175) {
        window._QuickCheckoutData.order_data.custom_field.pudo_location_id = location.Id;
    }
}

function ChooseMarker(selectedPoint) {
    var locationInfoAlert = $('.cargus-chosen-location');
    locationInfoAlert.html(showChosenLocation(selectedPoint));
    locationInfoAlert.show();
    handleLocationChange(selectedPoint);
    closeModal();
    return false;
}

var WidgetFnParams = {
    ChooseMarker,
    closeModal
}

var WidgetVarParams = {
    assets_path,
    DEFAULT_COORDINATES,
    KEY_MAPPING_VALUES,
    data_endpoint,
}

function openCargusMap() {
    const modal = document.getElementById("shipgomap-modal");
    modal.style.display = "flex";
    initializeCargus("shipgomap-modal", WidgetFnParams, WidgetVarParams);
}

// Initialize by adding the required DOM elements for Ship & Go.

function setupShippingMap() {
    // we need to inject map dom element
    var mapDom = '<div class="cargus-map-widget" id="shipgomap-modal" style="display: none;"></div>';
    mapDom += '<div class="position-relative mx-auto"><button type="button" class="btn btn-primary position-relative start-50 translate-middle-x" onclick="openCargusMap()" id="open-cargmap-btn">Alege cel mai apropiat Ship&Go!</button></div>';
    mapDom += '<div class="cargus-chosen-location" role="alert"></div>';
    var isMapNedeed = false;
    $("[name='shipping_method']").each(function() {
        if (isSippingRadioItem($(this))) {
            $(this).closest("div").after(mapDom);
            isMapNedeed = true;
        }
    });
    return isMapNedeed;
}

// Utility function to add a script or style to the document head
function addScriptOrStyle(path, callback) {
    const script = document.createElement("script");
    script.type = 'text/javascript';
    script.src = path;
    script.onload = callback;
    document.head.appendChild(script);
}

// Load required scripts
function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}


function checkPaymentMethod() {
    if (checkShipAndGoValue($("[name='shipping_method']:checked").val()) && $("[name='has_cash_on_delivery']").val() == 0) {
        // disable Cash on Delivery
        enableDisablePaymentMethod();
    } else {
        enableDisablePaymentMethod(false);
    }
}

function enableDisablePaymentMethod(disabled = true) {
    $("[name='payment_method']").each(function() {
        if ($(this).prop('value') == "cod") {
            if (disabled) {
                $(this).attr('disabled', 'disabled');
                $(this).prop('checked', false);
            } else {
                $(this).removeAttr('disabled');
            }
        }
    });
}

function isSippingRadioItem(elm) {
    if (checkShipAndGoValue(elm.attr('value'))) {
        return true;
    }
    return false;
}

function checkShipAndGoValue(val) {
    return 'cargus_ship_and_go.ship_and_go' == val;
}

function hideLocationDiv() {
    $('.cargus-chosen-location').hide();
}

function attachActionOnRadio() {
    $("[name='shipping_method']").each(function() {
        $(this).click(
            function() {
                if (isSippingRadioItem($(this))) {
                    $("#open-cargmap-btn").show();
                } else {
                    $("#open-cargmap-btn").hide();
                    $('.cargus-chosen-location').hide();
                    $("[name='has_cash_on_delivery']").val('');
                }
            }
        );
    });
}

function cargusCheckShipping() {
    var isMapNedeed = setupShippingMap();
    if (isMapNedeed) {
        attachActionOnRadio();
    }
}

showChosenLocation = function(location) {
    var locationPaymentsString = 'Locatie aleasa : <b>' + location.Name + '</b><br/>';
    return locationPaymentsString;
}