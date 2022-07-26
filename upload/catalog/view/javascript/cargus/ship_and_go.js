// var L;
//var $;
var GeoSearchControl;
var OpenStreetMapProvider;
var jQuery;
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
var Widget = (function () {
    function Widget(options) {
        this.testPins = [
            {
                Apartment: "1",
                City: "BUCURESTI",
                County: "Bucuresti",
                Email: "sg00004@pudooo.pl",
                Entrance: "1",
                Id: 34445,
                Latitude: 44.4316,
                LocationId: 1,
                Longitude: 26.09508,
                Name: "TEST PUDO 1",
                OpenHoursFrEnd: "20:00",
                OpenHoursFrStart: "08:00",
                OpenHoursMoEnd: "18:00",
                OpenHoursMoStart: "08:00",
                OpenHoursSaEnd: null,
                OpenHoursSaStart: "23:00",
                OpenHoursSuEnd: null,
                OpenHoursSuStart: null,
                OpenHoursThEnd: "20:00",
                OpenHoursThStart: "08:00",
                OpenHoursTuEnd: "20:00",
                OpenHoursTuStart: "08:00",
                OpenHoursWeEnd: "20:00",
                OpenHoursWeStart: "08:00",
                PostalCode: "666666",
                StreetName: "19 Noiembrie",
                StreetNo: "52",
                AcceptedPaymentType: {
                    Cash: true,
                    Card: true,
                    Online: false
                }
            },
            {
                Apartment: "1",
                City: "BUCURESTI",
                County: "Bucuresti",
                Email: "sg00004@pudooo.pl",
                Entrance: "1",
                Id: 114107,
                Latitude: 44.4229078,
                LocationId: 1,
                Longitude: 26.0956943,
                Name: "TEST PUDO 2",
                OpenHoursFrEnd: "20:00",
                OpenHoursFrStart: "08:00",
                OpenHoursMoEnd: "18:00",
                OpenHoursMoStart: "08:00",
                OpenHoursSaEnd: null,
                OpenHoursSaStart: "23:00",
                OpenHoursSuEnd: null,
                OpenHoursSuStart: null,
                OpenHoursThEnd: "20:00",
                OpenHoursThStart: "08:00",
                OpenHoursTuEnd: "20:00",
                OpenHoursTuStart: "08:00",
                openHoursWeEnd: "20:00",
                OpenHoursWeStart: "08:00",
                PostalCode: "666666",
                StreetName: "19 Noiembrie",
                StreetNo: "52",
                AcceptedPaymentType: {
                    Cash: false,
                    Card: true,
                    Online: true
                }
            }
        ];
        this.searchItems = [];
        this.scale = [
            { level: 9, scale: 20000 },
            { level: 10, scale: 10000 },
            { level: 11, scale: 5000 },
            { level: 12, scale: 2000 },
            { level: 13, scale: 1000 },
            { level: 14, scale: 500 },
            { level: 15, scale: 300 },
            { level: 16, scale: 100 },
            { level: 17, scale: 50 },
            { level: 18, scale: 30 },
            { level: 19, scale: 20 },
        ];
        this.zoomLevels = [
            { distance: 1, level: 14 },
            { distance: 3, level: 13 },
            { distance: 5, level: 12 },
            { distance: 10, level: 11 },
        ];
        this.onChanged = function (id) { };
        if (!this.options) {
            this.options = new WidgetOptions();
        }
        var params = new URLSearchParams(window.location.search);
        var selectedLocationId = params.get('selppid');
        if (selectedLocationId) {
            options.selectedLocationId = +selectedLocationId;
        }

        this.options = Object.assign(this.options, options);
        this.env = {
            pointsUrl: this.options.apiUrl + '/points',
            cssUrl: this.options.apiUrl + '/catalog/view/theme/default/stylesheet/ship_and_go.css',
            assetsUrl: this.options.apiUrl + '/catalog/view/theme/default/image/cargus'
        };
        Widget.instance = this;
    }

    Widget.prototype.init = function () {
        var _this = this;
        this.addScriptOrStyle('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', function () {
            _this.loadScript('https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js')
                .then(function () {
                    return _this.loadScript('https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js');
                })
                .then(function () {
                    return _this.loadScript('https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.74.0/dist/L.Control.Locate.min.js');
                })
                .then(function () {
                    return _this.loadScript('https://unpkg.com/leaflet-geosearch@3.0.0/dist/geosearch.umd.js');
                })
                .then(function () {
                    return _this.loadStyle('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
                })
                .then(function () {
                    return _this.loadStyle('https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css');
                })
                .then(function () {
                    return _this.loadStyle('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css');
                })
                .then(function () {
                    return _this.loadStyle('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css');
                })
                .then(function () {
                    return _this.loadStyle('https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.74.0/dist/L.Control.Locate.min.css');
                })
                .then(function () {
                    return _this.loadStyle('https://unpkg.com/leaflet-geosearch@3.0.0/dist/geosearch.css');
                })
                .then(function () {
                    return _this.loadStyle('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                })
                .then(function () {
                    return _this.loadStyle('https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css');
                })
                .then(function () {
                    return _this.loadStyle(Widget.instance.env.cssUrl);
                })
                .then(function () {
                    GeoSearchControl = window.GeoSearch.GeoSearchControl;
                    OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider;
                    $(_this.options.containerSelector).html(baseHtml);
                    //_this.calculateWidgetStyle();
                    _this.setupMapIcons();
                    _this.setupMap();
                });
        });
    };

    Widget.prototype.calculateWidgetStyle = function () {
        var style = $(Widget.instance.options.containerSelector)[0].style;
        var defaultStyle = new WidgetStyle();
        var calcStyle = Object.assign(defaultStyle, Widget.instance.options.style);
        style.setProperty('--background-color', calcStyle.backgroundColor);
        style.setProperty('--text-color', calcStyle.textColor);
        style.setProperty('--font', calcStyle.font);
        style.setProperty('--spinner-color', calcStyle.spinnerColor);
        style.setProperty('--button-text-color', calcStyle.sidebar.buttonTextColor);
        style.setProperty('--button-text-hover-color', calcStyle.sidebar.buttonTextHoverColor);
        style.setProperty('--button-background-color', calcStyle.sidebar.buttonBackgroundColor);
        style.setProperty('--button-background-hover-color', calcStyle.sidebar.buttonBackgroundHoverColor);
        style.setProperty('--pudo-item-text-color', calcStyle.sidebar.pudoItemTextColor);
        style.setProperty('--pudo-item-background-color', calcStyle.sidebar.pudoItemBackgroundColor);
        style.setProperty('--pudo-item-text-hover-color', calcStyle.sidebar.pudoItemTextHoverColor);
        style.setProperty('--pudo-item-background-hover-color', calcStyle.sidebar.pudoItemBackgroundHoverColor);
        style.setProperty('--pudo-item-selected-text-color', calcStyle.sidebar.pudoItemSelectedTextColor);
        style.setProperty('--pudo-item-selected-background-color', calcStyle.sidebar.pudoItemSelectedBackgroundColor);
        style.setProperty('--pudo-item-selected-button-text-color', calcStyle.sidebar.pudoItemSelectedButtonTextColor);
        style.setProperty('--pudo-item-selected-button-background-color', calcStyle.sidebar.pudoItemSelectedButtonBackgroundColor);
        style.setProperty('--pudo-item-selected-button-text-hover-color', calcStyle.sidebar.pudoItemSelectedButtonTextHoverColor);
        style.setProperty('--pudo-item-selected-button-background-hover-color', calcStyle.sidebar.pudoItemSelectedButtonBackgroundHoverColor);
        style.setProperty('--popup-background-color', calcStyle.popup.backgroundColor);
        style.setProperty('--popup-main-text-color', calcStyle.popup.mainTextColor);
        style.setProperty('--popup-details-text-color', calcStyle.popup.detailsTextColor);
        style.setProperty('--popup-button-text-color', calcStyle.popup.buttonTextColor);
        style.setProperty('--popup-button-background-color', calcStyle.popup.buttonBackgroundColor);
        style.setProperty('--popup-button-text-hover-color', calcStyle.popup.buttonTextHoverColor);
        style.setProperty('--popup-button-background-hover-color', calcStyle.popup.buttonBackgroundHoverColor);
    };

    Widget.prototype.changeStyleProperty = function (variable, value) {
        var style = $(Widget.instance.options.containerSelector)[0].style;
        style.setProperty(variable, value);
    };

    Widget.prototype.setupMap = function () {
        var _this = this;

        this.map = L.map(this.options.mapSelector, {
            scrollWheelZoom: this.options.zoomEnabled,
            dragging: !L.Browser.mobile,
            tab: !L.Browser.mobile
        });
        if (this.options.initialPosition) {
            this.map.setView([this.options.initialPosition.latitude, this.options.initialPosition.longitude], this.options.defaultZoomLevel);
        }
        this.map.on("zoomend", function (e) {
            Widget.instance.filterByLocation(Widget.instance.map.getBounds());
        });
        this.map.on("moveend", function (e) {
            Widget.instance.filterByLocation(Widget.instance.map.getBounds());
        });
        this.map.on("dragend", function (e) {
            Widget.instance.filterByLocation(Widget.instance.map.getBounds());
        });
        this.map.on("resize", function (e) {
            _this.calculateDistanceZoomLevel(e.newSize.x, e.newSize.y);
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(this.map);
        var southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        var bounds = L.latLngBounds(southWest, northEast);

        this.map.setMaxBounds(bounds);
        this.map.on('drag', function() {
            _this.map.panInsideBounds(bounds, { animate: false });
        });

        L.control.scale().addTo(this.map);
        L.control.locate().addTo(this.map);
        this.geocoder = new OpenStreetMapProvider();
        setTimeout(function () {
            Widget.instance.map.invalidateSize(true);
        }, 500);

        switch (Widget.instance.options.widgetSize) {
            case "full":
                $(Widget.instance.options.containerSelector).css('max-width', '100vw');
                if (!L.Browser.mobile) {
                    $(Widget.instance.options.containerSelector).css('max-height', '100vh');
                }
                $('.cwmp-widget-sidebar').css('height', '100vh');
                $('.cwmp-widget-container').css('height', '100vh');
                $('.cwmp-more-popup-container').css('width', '100vw');
                $('.cwmp-more-popup-container').css('height', '100vh');
                break;
            case "medium":
                $(Widget.instance.options.containerSelector).css('max-width', '1000px');
                if (!L.Browser.mobile) {
                    $(Widget.instance.options.containerSelector).css('max-height', '900px');
                }
                $('.cwmp-widget-sidebar').css('height', '900px');
                $('.cwmp-widget-container').css('height', '900px');
                $('.cwmp-more-popup-container').css('width', '1000px');
                $('.cwmp-more-popup-container').css('height', '900px');
                break;
            case "small":
                $(Widget.instance.options.containerSelector).css('max-width', '900px');
                if (!L.Browser.mobile) {
                    $(Widget.instance.options.containerSelector).css('max-height', '600px');
                }
                $('.cwmp-widget-sidebar').css('height', '600px');
                $('.cwmp-widget-container').css('height', '600px');
                $('.cwmp-more-popup-container').css('width', '900px');
                $('.cwmp-more-popup-container').css('height', '600px');
                break;
            default:
                $(Widget.instance.options.containerSelector).css('max-width', Widget.instance.options.width);
                if (!L.Browser.mobile) {
                    $(Widget.instance.options.containerSelector).css('max-height', Widget.instance.options.height);
                }
                $('.cwmp-widget-sidebar').css('height', Widget.instance.options.height);
                $('.cwmp-widget-container').css('height', Widget.instance.options.height);
                $('.cwmp-more-popup-container').css('width', Widget.instance.options.width);
                $('.cwmp-more-popup-container').css('height', Widget.instance.options.height);
                break;
        }
        this.getPudoPoints();
    };

    Widget.prototype.reinitializeMap = function() {
        if (Widget.instance.map) {
            Widget.instance.map.invalidateSize(true);
        }
    }

    Widget.prototype.setupMapIcons = function () {
        var icon = Widget.instance.options.pinIcon;
        if (!icon || icon == 'null') {
            icon = Widget.instance.env.assetsUrl + "/pin_cargus.png";
        }
        this.smallIcon = new L.icon({
            iconSize: [40, 50],
            iconAnchor: [15, 36],
            popupAnchor: [10, 12],
            iconUrl: icon
        });
    };

    Widget.prototype.getPudoPoints = function () {
        var _this = this;

        fetch(this.options.apiUrl + '/catalog/view/javascript/cargus/locations/pudo_locations.json', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
            cache: 'no-cache'
        })
            .then(function (response) { return response.json(); })
            .then(function (json) {
                _this.pins = json;
                _this.showPudoPoints();

                $.ajax({
                    type: "GET",
                    url: "index.php?route=extension/module/cargus_ship/cron",
                    cache: false,
                    async: true,
                    success: function(data){
                    },
                    error: function(data) {
                    }
                });
            });
    };

    Widget.prototype.showPudoPoints = function () {
        var _this = this;
        this.markers = L.layerGroup().addTo(this.map);
        for (var i = 0; i < this.pins.length; i++) {
            $('#cwmp-locations-list').append(this.getListItemContent(this.pins[i]));
            this.markers
                .addLayer(L.marker([this.pins[i].Latitude, this.pins[i].Longitude], { key: this.pins[i].Id, icon: this.smallIcon })
                    .addTo(this.map)
                    .on('click', function (e) {
                        var latLng = e.latlng;
                        _this.markers.eachLayer(function (layer) {
                            if (layer.getLatLng() == latLng) {
                                _this.markerClicked(layer.options.key);
                            }
                        });
                    })
                    .bindPopup(this.getPopupContent(this.pins[i]), {
                        minWidth: 350,
                        className: 'cwmp-custom-popup',
                        autoPanPadding: [50, 50]
                    }));
        }
        this.map.addLayer(this.markers);
        if (Widget.instance.options.selectedLocationId) {
            var location_1 = this.pins.find(function (p) { return p.Id == Widget.instance.options.selectedLocationId; });
            if (location_1) {
                this.markerClicked(Widget.instance.options.selectedLocationId);
                this.scrollToItem(Widget.instance.options.selectedLocationId);
                this.map.setView([location_1.Latitude, location_1.Longitude], Widget.instance.options.selectedZoomLevel);
                this.markers.eachLayer(function (layer) {
                    if (location_1.Id == layer.options.key) {
                        Widget.instance.map.setView([location_1.Latitude, location_1.Longitude], Widget.instance.options.selectedZoomLevel);
                        layer.openPopup();
                    }
                });
                this.showMore(Widget.instance.options.selectedLocationId);
            }
        }
        $('.cwmp-loader-backdrop').hide();
    };

    Widget.prototype.getListItemContent = function (location) {
        var content = '<li id="' + location.Id + '" class="cwmp-location-item" onclick="Widget.instance.locationSelected(this)" data-id="' + location.Id + '" data-name="' + location.Name + '" data-address="' + location.Address + '" data-latitude="' + location.Latitude + '" data-longitude="' + location.Longitude + '">';
        content += '<div class="cwmp-location">';
        content += '<div class="cwmp-location-details">';
        content += '<div class="cwmp-location-title">' + location.Name + '</div>';
        content += '<div class="cwmp-location-address">';
        content += this.buildAddress(location);
        content += '<br>';
        content += '</div>';
        content += '</div>';
        content += '<div class="cwmp-location-icon-container">';
        content += "<img src=\"" + Widget.instance.env.assetsUrl + "/logo.png\" alt=\"" + location.Name + '" class="cwmp-location-icon" />';
        content += '</div>';
        content += '</div>';
        content += '<div class="cwmp-location-work-hours">';
        content += '<hr />';
        content += '<ul class="cwmp-week-days">';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Monday</span>';
        content += this.calculateWorkTime(location.OpenHoursMoStart, location.OpenHoursMoEnd);
        content += '</li>';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Tuesday</span>';
        content += this.calculateWorkTime(location.OpenHoursTuStart, location.OpenHoursTuEnd);
        content += '</li>';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Wednesday</span>';
        content += this.calculateWorkTime(location.OpenHoursWeStart, location.OpenHoursWeEnd);
        content += '</li>';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Thursday</span>';
        content += this.calculateWorkTime(location.OpenHoursThStart, location.OpenHoursThEnd);
        content += '</li>';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Friday</span>';
        content += this.calculateWorkTime(location.OpenHoursFrStart, location.OpenHoursFrEnd);
        content += '</li>';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Saturday</span>';
        content += this.calculateWorkTime(location.OpenHoursSaStart, location.OpenHoursSaEnd);
        content += '</li>';
        content += '<li class="cwmp-week-day">';
        content += '<span class="day">Sunday</span>';
        content += this.calculateWorkTime(location.OpenHoursSuStart, location.OpenHoursSuEnd);
        content += '</li>';
        content += "</ul>";
        if (Widget.instance.options.showChooseButton) {
            content += '<div class="cwmp-choose-point-container">';
            content += "<button type=\"button\" class=\"cwmp-choose-point-button\" onclick=\"Widget.instance.choosePoint(event, " + location.Id + ")\">CHOOSE THIS POINT</button>";
            content += '</div>';
        }
        content += '</div>';
        content += '</li>';
        return content;
    };

    Widget.prototype.calculateWorkTime = function (start, end) {
        if (start && end) {
            return '<span>' + start + ' - ' + end + '</span>';
        }
        return 'closed';
    };

    Widget.prototype.buildAddress = function (location) {
        var address = location.StreetName + ' ' + (location.StreetNo ? location.StreetNo : '') + '<br />';
        address += location.City + ' ' + (location.PostalCode ? location.PostalCode : '');
        return address;
    };

    Widget.prototype.getPopupContent = function (location) {
        var c = '<div class="cwmp-popup-container">';
        c += '<div class="cwmp-popup-details">';
        c += '<div class="cwmp-popup-location-name">';
        c += "<img src=\"" + Widget.instance.env.assetsUrl + "/shipgo.svg\" class=\"cwmp-ship-go-icon\" />";
        c += '<h2>' + location.Name + '</h2>';
        c += '</div>';
        c += '<div class="cwmp-popup-location-address">';
        c += this.buildAddress(location);
        c += '</div>';
        c += '<hr class="cwmp-sidebar-separator" style="width: 100%" />';
        c += '<div class="cwmp-popup-workhours">';
        c += "<img src=\"" + Widget.instance.env.assetsUrl + "/open.svg\" class=\"cwmp-popup-details-icon\" />";
        c += '<div class="cwmp-working-hours-container">';
        c += '<div class="cwmp-details-row">';
        c += '<span style="flex: auto">Monday - Friday</span><span>' + this.calculateWorkTime(location.OpenHoursMoStart, location.OpenHoursMoEnd) + '</span>';
        c += '</div>';
        c += '<div class="cwmp-details-row">';
        c += '<span style="flex: auto">Saturday</span><span>' + this.calculateWorkTime(location.OpenHoursSuStart, location.OpenHoursSuEnd) + '</span>';
        c += '</div>';
        c += '</div>';
        c += '</div>';
        c += '<div class="cwmp-cod-details">';
        c += "<img src=\"" + Widget.instance.env.assetsUrl + "/cod.svg\" class=\"cwmp-popup-details-icon\" />";
        c += "<div class=\"cwmp-details-row\" style=\"flex: auto\"><span style=\"flex: auto\">COD:</span><span>" + this.getPaymentType(location.AcceptedPaymentType) + "</span></div>";
        c += '</div>';
        c += '<div style="flex: auto;">';
        c += '</div>';
        c += '<div class="cwmp-popup-select-button">';
        if (Widget.instance.options.showChooseButton) {
            c += '<button type="button" class="cwmp-popup-button" onclick="Widget.instance.choosePoint(event, ' + location.Id + ')">CHOOSE THIS POINT<span class="spinner-border spinner-border-sm ml-1 d-none" role="status" aria-hidden="true"></span></button>';
        }
        c += '<button type="button" class="cwmp-popup-button more-button" onclick="Widget.instance.showMore(' + location.Id + ', event)">MORE</button>';
        c += '</div>';
        c += '</div>';
        c += '<div class="cwmp-popup-location-details">';

        if (/http/.test(location.MainPicture)) {
            c += '<img src="' + location.MainPicture + '" class="cwmp-popup-location-image"/>';
        } else if (location.MainPicture) {
            c += '<img src="data:image/png;base64, ' + location.MainPicture + '" class="cwmp-popup-location-image" />';
        }
        else {
            c +=
                "<div class=\"cwmp-no-picture\">\n                <img src=\"" + Widget.instance.env.assetsUrl + "/logo.png\" alt=\"" + location.Name + "\" class=\"cwmp-location-no-picture\" />\n            </div>";
        }
        c += '</div>';
        c += '</div>';
        return c;
    };

    Widget.prototype.calculateDistanceFromPoint = function (location) {
        return '800m';
    };

    Widget.prototype.search = function () {
        var hidden = 'cwmp-item-hidden';
        var text = $("#pudoSearch").val().toLowerCase();
        var items = $('.cwmp-location-item');
        if (text != '') {
            for (var i = 0; i < items.length; i++) {
                var id = items[i].getAttribute("data-id").toLowerCase();
                var name = items[i].getAttribute("data-name").toLowerCase();
                var address = items[i].getAttribute("data-address").toLowerCase();
                if (name.indexOf(text) > -1 || address.indexOf(text) > -1) {
                    items[i].classList.remove(hidden);
                }
                else {
                    items[i].classList.add(hidden);
                }
            }
        }
        else {
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove(hidden);
            }
        }
    };

    Widget.prototype.filterByLocation = function (bounds) {
        var hidden = 'cwmp-item-hidden';
        var items = $('.cwmp-location-item');
        for (var i = 0; i < items.length; i++) {
            var id = items[i].getAttribute("data-id").toLowerCase();
            var name_1 = items[i].getAttribute("data-name").toLowerCase();
            var address = items[i].getAttribute("data-address").toLowerCase();
            var lat = items[i].getAttribute("data-latitude").toLowerCase();
            var lon = items[i].getAttribute("data-longitude").toLowerCase();
            if (bounds.contains(L.latLng(lat, lon))) {
                items[i].classList.remove(hidden);
            }
            else {
                items[i].classList.add(hidden);
            }
        }
    };

    Widget.prototype.searchAddress = function () {
        var text = $('#searchInput').val();
        if (Widget.instance.oldSearch != text) {
            $('#searchResults').empty();
            Widget.instance.oldSearch = text;
            Widget.instance.geocoder.search({ query: text + ", Romania" }).then(function (result) {
                Widget.instance.searchItems = result;
                if (result.length > 0) {
                    $('.cwmp-search-results-container').show();
                }
                else {
                    $('.cwmp-search-results-container').hide();
                }
                for (var i = 0; i < result.length; i++) {
                    $('#searchResults').append(Widget.instance.getSearchItem(result[i]));
                }
            });
        }
        else {
            if (Widget.instance.highlitedSearchItem) {
                this.navigateTo(Widget.instance.highlitedSearchItem);
            }
        }
    };

    Widget.prototype.getSearchItem = function (item) {
        var content = '<li id="' + item.raw.osm_id + '" class="cwmp-search-item" data-id="' + item.raw.osm_id + '" onclick="Widget.instance.showSearchLocation(' + item.y + ',' + item.x + ',' + item.raw.osm_id + ', event)">';
        content += '<span>' + item.label + '</span></li>';
        return content;
    };

    Widget.prototype.showSearchLocation = function (lat, lon, id, event) {
        Widget.instance.map.setView([lat, lon], Widget.instance.options.selectedZoomLevel);
        Widget.instance.selectedSearchItem = id;
        this.selectSearchItem(id, event);
    };

    Widget.prototype.highlightSearchItem = function (id) {
        var items = $('.cwmp-search-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('cwmp-highlited');
        }
        $('#' + id)[0].classList.add('cwmp-highlited');
    };

    Widget.prototype.selectSearchItem = function (id, event) {
        var items = $('.cwmp-search-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('cwmp-selected');
        }
        $('#' + id)[0].classList.add('cwmp-selected');
        Widget.instance.highlitedSearchItem = null;
        Widget.instance.oldSearch = '';
        $('#searchInput').val('');
        $('#searchResults').empty();
        $('.cwmp-search-results-container').hide();
        event.stopImmediatePropagation();
    };

    Widget.prototype.navigateTo = function (id) {
        var searchLocation = Widget.instance.searchItems.find(function (s) { return s.raw.osm_id == id; });
        this.selectSearchItem(id);
        Widget.instance.map.setView([searchLocation.y, searchLocation.x], Widget.instance.options.selectedZoomLevel);
    };

    Widget.prototype.onKeyUp = function (event) {
        if (event.key == 'Enter') {
            Widget.instance.searchAddress();
        }
        if (!$('#searchInput').val()) {
            $('#searchResults').empty();
            $('.cwmp-search-results-container').hide();
            Widget.instance.oldSearch = '';
            Widget.instance.highlitedSearchItem = null;
            Widget.instance.selectedSearchItem = null;
        }
    };

    Widget.prototype.onKeyDown = function (event) {
        switch (event.key) {
            case 'ArrowUp':
            {
                event.preventDefault();
                if (Widget.instance.highlitedSearchItem) {
                    var currentIndex = Widget.instance.searchItems.indexOf(Widget.instance.searchItems.find(function (i) { return i.raw.osm_id == Widget.instance.highlitedSearchItem; }));
                    if (currentIndex != 0) {
                        Widget.instance.highlitedSearchItem = Widget.instance.searchItems[currentIndex - 1].raw.osm_id;
                        this.highlightSearchItem(Widget.instance.highlitedSearchItem);
                    }
                    else {
                        Widget.instance.highlitedSearchItem = Widget.instance.searchItems[Widget.instance.searchItems.length - 1].raw.osm_id;
                        this.highlightSearchItem(Widget.instance.highlitedSearchItem);
                    }
                }
                else {
                    if (Widget.instance.searchItems.length > 0) {
                        Widget.instance.highlitedSearchItem = Widget.instance.searchItems[Widget.instance.searchItems.length - 1].raw.osm_id;
                        this.highlightSearchItem(Widget.instance.highlitedSearchItem);
                    }
                }
            }
                break;
            case 'ArrowDown':
            {
                event.preventDefault();
                if (Widget.instance.highlitedSearchItem) {
                    var currentIndex = Widget.instance.searchItems.indexOf(Widget.instance.searchItems.find(function (i) { return i.raw.osm_id == Widget.instance.highlitedSearchItem; }));
                    if (currentIndex != Widget.instance.searchItems.length - 1) {
                        Widget.instance.highlitedSearchItem = Widget.instance.searchItems[currentIndex + 1].raw.osm_id;
                        this.highlightSearchItem(Widget.instance.highlitedSearchItem);
                    }
                    else {
                        Widget.instance.highlitedSearchItem = Widget.instance.searchItems[0].raw.osm_id;
                        this.highlightSearchItem(Widget.instance.highlitedSearchItem);
                    }
                }
                else {
                    if (Widget.instance.searchItems.length > 0) {
                        Widget.instance.highlitedSearchItem = Widget.instance.searchItems[0].raw.osm_id;
                        this.highlightSearchItem(Widget.instance.highlitedSearchItem);
                    }
                }
            }
                break;
            case 'Escape':
            {
                $('#searchInput').val('');
                $('#searchResults').empty();
                $('.cwmp-search-results-container').hide();
                Widget.instance.highlitedSearchItem = null;
                Widget.instance.selectedSearchItem = null;
            }
                break;
        }
    };

    Widget.prototype.zoomChanged = function () {
        var distanceValue = 10; // Default to 10
        var zoomLevel = this.getZoomLevel(distanceValue);
        Widget.instance.options.selectedZoomLevel = zoomLevel;
        Widget.instance.map.setZoom(zoomLevel);
    };

    Widget.prototype.calculateDistanceZoomLevel = function (width, height) {
        var mapWidth = width;
        var scale = 73;
        var widthSections = Math.round(mapWidth / scale);
        Widget.instance.zoomLevels.forEach(function (l) {
            var sectionScaleSize = (l.distance * 1000) / widthSections;
            var closest = Widget.instance.scale.reduce(function (a, b) {
                var aDiff = Math.abs(a.scale - sectionScaleSize);
                var bDiff = Math.abs(b.scale - sectionScaleSize);
                if (aDiff == bDiff) {
                    return a > b ? a : b;
                }
                else {
                    return bDiff < aDiff ? b : a;
                }
            });
            l.level = closest.level;
        });
    };

    Widget.prototype.getZoomLevel = function (distance) {
        var level = Widget.instance.zoomLevels.find(function (l) { return l.distance == distance; });
        return level.level;
    };

    Widget.prototype.markerClicked = function (id) {
        var items = $('.cwmp-location-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('cwmp-highlighted');
            $(items[i]).find('.cwmp-location-work-hours').hide();
        }
        Widget.instance.options.selectedLocationId = id;
        $('#' + id)[0].classList.add('cwmp-highlighted');
        $('#' + id).find('.cwmp-location-work-hours').show();
    };

    Widget.prototype.scrollToItem = function (id) {
        var pudoItem = $('#' + id);
        var position = pudoItem[0].getBoundingClientRect().top;
        $('.cwmp-widget-sidebar')[0].scrollTo({
            top: position - 400,
            behaviour: 'smooth'
        });
    };

    Widget.prototype.locationSelected = function (el) {
        var ct = $(el);
        var id = ct.attr('data-id');
        var lat = ct.attr('data-latitude');
        var lon = ct.attr('data-longitude');
        var items = $('.cwmp-location-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('cwmp-highlighted');
            $(items[i]).find('.cwmp-location-work-hours').hide();
        }
        Widget.instance.options.selectedLocationId = id;
        ct[0].classList.add('cwmp-highlighted');
        $(ct[0]).find('.cwmp-location-work-hours').show();
        Widget.instance.markers.eachLayer(function (layer) {
            if (id == layer.options.key) {
                Widget.instance.map.setView([lat, lon], Widget.instance.options.selectedZoomLevel);
                layer.openPopup();
            }
        });
    };

    Widget.prototype.choosePoint = function (event, id) {
        event.stopPropagation();
        var location = Widget.instance.pins.find(function (p) { return p.Id == id; });
        Widget.instance.onChanged(location);
    };

    Widget.prototype.showMore = function (id, event) {
        var location = Widget.instance.pins.find(function (l) { return l.Id == id; });
        if (!location) {
            return;
        }
        var c = '<div class="cwmp-more-popup-container">';
        c += '<div class="cwmp-more-popup-details">';
        c += '<div class="cwmp-more-popup-location-name">';
        c += '<h2 style="font-weight: 900">' + location.Symbol + '</h2>';
        c += '<h2 style="margin-left: 10px">' + location.Name + '</h2>';
        c += '</div>';
        c += '<div class="cwmp-more-popup-details-wrapper">';
        c += '<div class="cwmp-more-popup-address-details">';
        c += '<div>';
        c += "<img src=\"" + Widget.instance.env.assetsUrl + "/shipgo.svg\" class=\"cwmp-more-ship-go-icon\" />";
        c += '</div>';
        c += '<div class="cwmp-more-popup-location-address">';
        c += "<p>" + this.buildAddress(location) + "</p>";
        c += '<p>';
        c += 'Program: L:' + this.calculateMoreWorkTime(location.OpenHoursMoStart, location.OpenHoursMoEnd);
        c += ' Ma: ' + this.calculateMoreWorkTime(location.OpenHoursTuStart, location.OpenHoursTuEnd);
        c += ' Mi: ' + this.calculateMoreWorkTime(location.OpenHoursWeStart, location.OpenHoursWeEnd);
        c += ' J: ' + this.calculateMoreWorkTime(location.OpenHoursThStart, location.OpenHoursThEnd);
        c += ' V: ' + this.calculateMoreWorkTime(location.OpenHoursFrStart, location.OpenHoursFrEnd);
        c += ' S: ' + this.calculateMoreWorkTime(location.OpenHoursSaStart, location.OpenHoursSaEnd);
        c += ' D: ' + this.calculateMoreWorkTime(location.OpenHoursSuStart, location.OpenHoursSuEnd);
        c += '</p>';
        c += '<p>';
        c += 'Plati: ' + (location.ServiceCOD ? 'Incaseaza ramburs' : 'Nu incaseaza ramburs');
        c += '</p>';
        c += '<p>';
        c += 'Tip plata: ' + this.getPaymentType(location.AcceptedPaymentType);
        c += '</p>';
        c += '</div>';
        c += '</div>';
        c += '<div class="cwmp-more-popup-location-description">';
        c += '<span>' + location.AddressDescription + '</location>';
        c += '</div>';
        c += '</div>';
        c += '<div class="cwmp-more-popup-select-button">';
        c += '<button type="button" class="cwmp-popup-button navigate-btn" onclick="Widget.instance.openGoogleMaps(' + location.Latitude + ' , ' + location.Longitude + ')">NAVIGATE</button>';
        c += '</div>';
        c += '</div>';
        c += '<div class="cwmp-more-popup-location-details">';
        c += '<div class="cwmp-more-popup-close">';
        c += '<button type="button" class="cwmp-more-popup-close-button" onclick="Widget.instance.closeMore()">x</button>';
        c += '</div>';
        if (location.MainPicture) {
            c += '<img src="data:image/png;base64, ' + location.MainPicture + '" class="cwmp-more-popup-location-image" />';
        }
        else {
            c += "<img src=\"" + Widget.instance.env.assetsUrl + "/cargus.svg\" class=\"cwmp-more-popup-location-image\" />";
        }
        c += '</div>';
        c += '</div>';
        $('#morePopup').show();
        $('#morePopupContent').empty();
        $('#morePopupContent').append(c);

        event.stopImmediatePropagation();
    };

    Widget.prototype.closeMore = function () {
        $('#morePopup').hide();
    };

    Widget.prototype.calculateMoreWorkTime = function (start, end) {
        if (start && end) {
            return start + " - " + end;
        }
        return 'closed';
    };

    Widget.prototype.getPaymentType = function (paymentType) {
        var paymentString = '';
        if (paymentType.Cash) {
            paymentString = translations.shipAndGoPayments.cash_payment_available;
        }

        if (paymentType.Card) {
            paymentString += paymentString != '' ? ', ' + translations.shipAndGoPayments.card_payment_available : translations.shipAndGoPayments.card_payment_available;
        }

        if (paymentType.Online) {
            paymentString += paymentString != '' ? ', ' + translations.shipAndGoPayments.online_payment_available : translations.shipAndGoPayments.online_payment_available;
        }

        if (!paymentType.Cash && !paymentType.Card && !paymentType.Online) {
            paymentString = translations.shipAndGoPayments.no_payment_available;
        }

        return paymentString;
    };
    Widget.prototype.openGoogleMaps = function (latitude, longitude) {
        window.open("https://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=" + latitude + "," + longitude);
    };
    Widget.prototype.addScriptOrStyle = function (path, callback) {
        var script = document.createElement("script");
        script.type = 'text/javascript';
        script.src = path;
        script.onload = callback;
        document.head.appendChild(script);
    };
    Widget.prototype.loadScript = function (url) {
        return $.ajax({
            url: url,
            cache: true,
            dataType: 'script'
        });
    };
    Widget.prototype.loadStyle = function (url) {
        $(document.createElement('link')).attr({
            href: url,
            type: 'text/css',
            rel: 'stylesheet'
        }).appendTo('head');
    };
    Widget.prototype.initScript = function (widgetOptions) {
        return "\n            <script src=\"" + widgetOptions.apiUrl + "/widget.js\"></script>\n            <div id=\"" + widgetOptions.containerSelector.substring(1, widgetOptions.containerSelector.length) + "\"></div>\n            <script>\n                (function() {\n                    // Setup map\n                    var widget = new Widget({\n                        key: '" + widgetOptions.key + "',\n                        initialPosition: {\n                            latitude: '" + widgetOptions.initialPosition.latitude + "',\n                            longitude: '" + widgetOptions.initialPosition.longitude + "'\n                        },\n                        selectedLocationId: null,\n                        mapSelector: '" + widgetOptions.mapSelector + "',\n                        containerSelector: '" + widgetOptions.containerSelector + "',\n                        width: '" + widgetOptions.width + "',\n                        height: '" + widgetOptions.height + "',\n                        zoomEnabled: '" + widgetOptions.zoomEnabled + "',\n                        defaultZoomLevel: '" + widgetOptions.defaultZoomLevel + "',\n                        pinIcon: '" + widgetOptions.pinIcon + "',\n                        lang: '" + widgetOptions.lang + "',\n                        widgetSize: '" + widgetOptions.widgetSize + "',\n                        apiUrl: '" + widgetOptions.apiUrl + "',\n                        showChooseButton: " + widgetOptions.showChooseButton + ",\n                        style: {\n                            font: '" + widgetOptions.style.font + "',\n                            backgroundColor: '" + widgetOptions.style.backgroundColor + "',\n                            textColor: '" + widgetOptions.style.textColor + "',\n                            spinnerColor: '" + widgetOptions.style.spinnerColor + "',\n                            sidebar: {\n                                buttonTextColor: '" + widgetOptions.style.sidebar.buttonTextColor + "',\n                                buttonTextHoverColor: '" + widgetOptions.style.sidebar.buttonTextHoverColor + "',\n                                buttonBackgroundColor: '" + widgetOptions.style.sidebar.buttonBackgroundColor + "',\n                                buttonBackgroundHoverColor: '" + widgetOptions.style.sidebar.buttonBackgroundHoverColor + "',\n                                \n                                pudoItemTextColor: '" + widgetOptions.style.sidebar.pudoItemTextColor + "',\n                                pudoItemBackgroundColor: '" + widgetOptions.style.sidebar.pudoItemBackgroundColor + "',\n                                pudoItemTextHoverColor: '" + widgetOptions.style.sidebar.pudoItemTextHoverColor + "',\n                                pudoItemBackgroundHoverColor: '" + widgetOptions.style.sidebar.pudoItemBackgroundHoverColor + "',\n\n                                pudoItemSelectedTextColor: '" + widgetOptions.style.sidebar.pudoItemSelectedTextColor + "',\n                                pudoItemSelectedBackgroundColor: '" + widgetOptions.style.sidebar.pudoItemSelectedBackgroundColor + "',\n                                pudoItemSelectedButtonTextColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonTextColor + "',\n                                pudoItemSelectedButtonBackgroundColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonBackgroundColor + "',\n                                pudoItemSelectedButtonTextHoverColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonTextHoverColor + "',\n                                pudoItemSelectedButtonBackgroundHoverColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonBackgroundHoverColor + "'\n                            },\n                            popup: {\n                                backgroundColor: '" + widgetOptions.style.popup.backgroundColor + "',\n                                mainTextColor: '" + widgetOptions.style.popup.mainTextColor + "',\n                                detailsTextColor: '" + widgetOptions.style.popup.detailsTextColor + "',\n                                buttonTextColor: '" + widgetOptions.style.popup.buttonTextColor + "',\n                                buttonBackgroundColor: '" + widgetOptions.style.popup.buttonBackgroundColor + "',\n                                buttonTextHoverColor: '" + widgetOptions.style.popup.buttonTextHoverColor + "',\n                                buttonBackgroundHoverColor: '" + widgetOptions.style.popup.buttonBackgroundHoverColor + "',\n                            }\n                        }\n                    });\n                    widget.init();\n                    widget.onChanged = function(location) {\n                        // Location selection changed\n                    };\n                })();\n            </script>";
    };
    ;
    return Widget;
}());

var baseHtml = "\n    <div class=\"cwmp-widget-container\">\n        <div class=\"cwmp-widget-sidebar\">\n            <div class=\"cwmp-loader-backdrop\">\n                <div class=\"cwmp-loader\">\n                </div>\n            </div>\n            <div class=\"cwmp-sidebar-header-wrap\">\n                <div class=\"cwmp-sidebar-header-text\">\n                    <h3>CAUTA O LOCATIE</h3>\n                </div>\n                <div class=\"cwmp-sidebar-search-section\">\n                    <div class=\"search-input-container\">\n                        <input id=\"searchInput\" onkeyup=\"Widget.instance.onKeyUp(event)\"\n                            onkeydown=\"Widget.instance.onKeyDown(event)\"\n                            placeholder=\"introdu adresa\" class=\"cwmp-search-input\" />\n                    </div>\n                <div class=\"cwmp-search-button-container\">\n                        <button type=\"button\" class=\"cwmp-search-button\" onclick=\"Widget.instance.searchAddress()\">CAUTA</button>\n                    </div>\n                </div>\n                <div class=\"cwmp-search-results-container\">\n                    <h3>Search results</h3>\n                    <ul class=\"cwmp-search-results\" id=\"searchResults\">\n\n                    </ul>\n                </div>\n                <hr class=\"cwmp-sidebar-separator\" />\n            </div>\n            <div class=\"cwmp-sidebar-locations-container\">\n                <div class=\"cwmp-sidebar-locations-title\">\n                    <h3>LISTA PUNCTE DISPONIBILE</h3>\n                </div>\n                <div class=\"sidebar-locations\">\n                    <ul id=\"cwmp-locations-list\" class=\"cwmp-sidebar-locations-list\">\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class=\"cwmp-widget-map\">\n            <div id=\"map\"></div>\n        </div>\n\n        <div id=\"morePopup\">\n            <div class=\"cwmp-more-wrapper\">\n                <div class=\"cwmp-widget-more-popup-backdrop\" onclick=\"Widget.instance.closeMore()\">\n                </div>\n                <div id=\"morePopupContent\" class=\"cwmp-widget-more-popup\">\n                </div>\n            </div>\n        </div>\n    </div>\n";

var PudoLocation = (function () {
    function PudoLocation() {
    }
    return PudoLocation;
}());
var WidgetOptions = (function () {
    function WidgetOptions() {
        this.key = '';
        this.initialPosition = { latitude: 45.758037, longitude: 21.229143 };
        this.selectedLocationId = null;
        this.mapSelector = 'map';
        this.containerSelector = 'widget';
        this.width = 1000;
        this.height = 600;
        this.zoomEnabled = false;
        this.defaultZoomLevel = 14;
        this.selectedZoomLevel = 14;
        this.lang = 'EN';
        this.configurationMode = false;
        this.showChooseButton = true;
    }
    return WidgetOptions;
}());
var WidgetStyle = (function () {
    function WidgetStyle(opt) {
        if (opt === void 0) { opt = {}; }
        this.backgroundColor = 'white';
        this.textColor = 'black';
        this.spinnerColor = '#F1A832';
        this.font = opt['font'] || "'Montserrat', sans-serif";
        this.backgroundColor = opt['backgroundColor'] || 'white';
        this.textColor = opt['textColor'] || 'black';
    }
    return WidgetStyle;
}());
var WidgetSidebarStyle = (function () {
    function WidgetSidebarStyle(opt) {
        if (opt === void 0) { opt = {}; }
        this.buttonTextColor = opt['buttonTextColor'] || 'white';
        this.buttonTextHoverColor = opt['buttonTextHoverColor'] || 'white';
        this.buttonBackgroundColor = opt['buttonBackgroundColor'] || '#F1A832';
        this.buttonBackgroundHoverColor = opt['buttonBackgroundHoverColor'] || 'darkorange';
        this.pudoItemTextColor = opt['pudoItemTextColor'] || '#666';
        this.pudoItemBackgroundColor = opt['pudoItemBackgroundColor'] || '#eee';
        this.pudoItemTextHoverColor = opt['pudoItemTextHoverColor'] || '#666';
        this.pudoItemBackgroundHoverColor = opt['pudoItemBackgroundHoverColor'] || 'lightgray';
        this.pudoItemSelectedTextColor = opt['pudoItemSelectedTextColor'] || 'white';
        this.pudoItemSelectedBackgroundColor = opt['pudoItemSelectedBackgroundColor'] || '#F1A832';
        this.pudoItemSelectedButtonTextColor = opt['pudoItemSelectedButtonTextColor'] || '#4d4d4d';
        this.pudoItemSelectedButtonBackgroundColor = opt['pudoItemSelectedButtonBackgroundColor'] || 'white';
        this.pudoItemSelectedButtonTextHoverColor = opt['pudoItemSelectedButtonTextHoverColor'] || 'white';
        this.pudoItemSelectedButtonBackgroundHoverColor = opt['pudoItemSelectedButtonBackgroundHoverColor'] || 'darkorange';
    }
    return WidgetSidebarStyle;
}());

var WidgetPopupStyle = (function () {
    function WidgetPopupStyle(opt) {
        if (opt === void 0) { opt = {}; }
        this.backgroundColor = opt['backgroundColor'] || 'white';
        this.mainTextColor = opt['mainTextColor'] || '#4d4d4d';
        this.detailsTextColor = opt['detailsTextColor'] || '#666';
        this.buttonTextColor = opt['buttonTextColor'] || 'white';
        this.buttonBackgroundColor = opt['buttonBackgroundColor'] || '#F1A832';
        this.buttonTextHoverColor = opt['buttonTextHoverColor'] || 'white';
        this.buttonBackgroundHoverColor = opt['buttonBackgroundHoverColor'] || 'darkorange';
    }
    return WidgetPopupStyle;
}());

var widget;
function setupShippingMap(){
    // we need to inject map dom element
    var mapDom = '<div id="map_container">';
    mapDom += '<div class="ship-and-go-map right w-100 mb-3"><div id="widget"></div></div>';
    mapDom += '<div class="alert alert-warning d-none location-alert mt-2 mr-2" role="alert"></div>';
    mapDom += '<div class="alert alert-danger d-none location-error mt-2 mr-2" role="alert">';
    mapDom += 'A aparut o problema la salvarea locatiei. Incercati din nou!';
    mapDom += '</div>';
    mapDom += '<input type="hidden" name="has_cash_on_delivery" value="">';
    mapDom += 'Continue';
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
function attachActionOnRadio(){
   $("[name='shipping_method']").each(function (){
    $(this).click(
        function(){
            if(isSippingRadioItem($(this))){
                  $("#map_container").show();
                  toggleShipingMethodSave(0);

            }else{
                $("#map_container").hide();
                hideLocationDiv();
                toggleShipingMethodSave();
                $("[name='has_cash_on_delivery']").val('');
            }
        }
    );
   });
}

function checkPaymentMethod(){
  if(checkShipAndGoValue($("[name='shipping_method']:checked").val()) && $("[name='has_cash_on_delivery']").val() == 0){
    // disable Cash on Delivery
    enableDisablePaymentMethod();
  }else{
    enableDisablePaymentMethod(false);
  }
}
function hideLocationDiv(){
    $('.location-alert').addClass('d-none');
}

function toggleShipingMethodSave(show =  1){
    if(show){
        $("#button-shipping-method").removeAttr('disabled');
    }else{
        $("#button-shipping-method").attr('disabled','disabled');
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


function showMapBasedOnShipingRadioChecked(){
    $("[name='shipping_method']").each(function (){
             if(isSippingRadioItem($(this)) && $(this).prop('checked')){
                   $("#map_container").show();
                   toggleShipingMethodSave(0);
             }
         });
 }



function cargusCheckShipping(){
    var isMapNedeed = setupShippingMap();
    if(isMapNedeed){
        $("#map_container").hide();
        renderMap();
        attachActionOnRadio();
        showMapBasedOnShipingRadioChecked();
    }

}

function checkShipAndGoValue(val){
    return 'cargus_ship_and_go.ship_and_go' == val;
}

function isSippingRadioItem(elm){
    if(checkShipAndGoValue(elm.attr('value'))){
        return true;
    }
    return false;
}

function renderMap() {
    // Setup map
    var url = window.location.href;

    var arr = url.split("/");

    widget = new Widget({
        key: '',
        initialPosition: { latitude: 44.435701, longitude: 26.101646 },
        mapSelector: 'map',
        containerSelector: '#widget',
        height: '100vh',
        width: '100%',
        zoomEnabled: true,
        defaultZoomLevel: 13,
        pinIcon: null,
        lang: 'EN',
        widgetSize: 'small',
        //IMPORTANT ADD /prestashop
        apiUrl: arr[0] + "//" + arr[2] +'/',
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
        },
        selectedLocation: null
    });
    widget.init();

    widget.onChanged = function(location) {
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
    };

    function checkAndRenderContinue(data, location) {
        var continueButton      = $('button.continue:visible');
        var continueButtonExtra = $('button.continue-extra');
        var locationInfoAlert = $('.location-alert');
        var locationErrorAlert = $('.location-error');

        if (!data.responseText.includes('ERROR')) {
            locationInfoAlert.html(createAlertHTML(location));
            locationInfoAlert.removeClass('d-none');

            widget.selectedLocation = location;
            widget.map.closePopup();


            continueButton.prop('disabled', false);

            continueButtonExtra.removeClass('d-none');
            locationErrorAlert.addClass('d-none');
            $("[name='has_cash_on_delivery']").val(location.ServiceCOD ? 1 : 0);
            toggleShipingMethodSave(1);
           /* $('html, body').animate({
                scrollTop: $(".continue-extra").offset().top
            }, 200);*/
        } else {
            continueButton.prop('disabled', true);
            locationErrorAlert.removeClass('d-none');
            widget.map.closePopup();
        }
    }

    createAlertHTML = function (location) {
        var locationPaymentsString = 'Locatie aleasa : <b>' + location.Name + '</b><br/>';

        if (!location.ServiceCOD) {
            locationPaymentsString += translations.noPaymentsAvailableOnPudoLocation + "<br/><span class='text-danger'> " + translations.card_payment_mandatory + "</span>";
        } else {
            locationPaymentsString += translations.paymentsAvailableOnPudoLocation + Widget.instance.getPaymentType(location.AcceptedPaymentType);
        }

        return locationPaymentsString;
    }

    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    respondToVisibility = function(element, callback) {
        var options = {
            root: document.documentElement
        }

        var observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                callback(entry.intersectionRatio > 0);
            });
        }, options);

        observer.observe(element);
    }

    respondToVisibility(document.getElementById("widget"), visible => {
        widget.reinitializeMap();
    });

    var targetNode = document.getElementById("widget").parentElement.parentElement;

    var observer = new MutationObserver(function(){
        if(targetNode.style.display != 'none'){
            widget.reinitializeMap();
        }
    });

    observer.observe(targetNode, { attributes: true, childList: true });
}