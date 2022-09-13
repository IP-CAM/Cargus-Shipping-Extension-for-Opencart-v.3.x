var L;
var GeoSearchControl;
var OpenStreetMapProvider;
var $;
var jQuery;
var Widget = (function () {
    function Widget(options) {
        this.testPins = [
            {
                Apartment: "1",
                Address: "BUCURESTI, Strada 19 Noiembrie, Nr. 52, Sc. 1, Et. 1, Ap. 1, Cod postal. 666666",
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
                PointType: "2",
                AdditionalAddressInfo: "Test aditional ",
                AcceptedPaymentType: {
                    Cash: true,
                    Card: true,
                    Online: false
                }
            },
            {
                Apartment: "1",
                Address: "BUCURESTI, Strada 11 Iunie, Nr. 14, Cod postal. 030167",

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
                PointType: "55",
                AdditionalAddressInfo: "Necesita Cargus Mobile App",
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
            cssUrl: this.options.apiUrl + '/widget.css',
            assetsUrl: this.options.apiUrl + '/assets'
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

                    if (_this.options.showOnlyShipGo && !_this.options.showOnlyApm) {
                        if (_this.options.showFilters) {
                            $(_this.options.containerSelector).html(baseHtmlWithFilters);
                        }
                        else {
                            $(_this.options.containerSelector).html(baseHtml);
                        }
                        _this.calculateWidgetStyle();
                        _this.setupMapIcons();
                        _this.setupMap("sg");
                    }
                    else if (_this.options.showOnlyApm && !_this.options.showOnlyShipGo) {
                        if (_this.options.showFilters) {
                            $(_this.options.containerSelector).html(baseHtmlWithFilters);
                        }
                        else {
                            $(_this.options.containerSelector).html(baseHtml);
                        }
                        _this.calculateWidgetStyle();
                        _this.setupMapIcons();
                        _this.setupMap("apm");
                    }
                    else {
                        $(_this.options.containerSelector).html(baseHtmlWithFilters);
                        _this.calculateWidgetStyle();
                        _this.setupMapIcons();
                        _this.setupMap("all");
                    }
                });
        });
    };
    Widget.prototype.redraw = function () {
        var _this = this;
        if (_this.options.showOnlyShipGo && !_this.options.showOnlyApm) {
            if (_this.options.showFilters) {
                $(_this.options.containerSelector).html(baseHtmlWithFilters);
            }
            else {
                $(_this.options.containerSelector).html(baseHtml);
            }
            _this.calculateWidgetStyle();
            _this.setupMapIcons();
            _this.setupMap("sg");
        }
        else if (_this.options.showOnlyApm && !_this.options.showOnlyShipGo) {
            if (_this.options.showFilters) {
                $(_this.options.containerSelector).html(baseHtmlWithFilters);
            }
            else {
                $(_this.options.containerSelector).html(baseHtml);
            }
            _this.calculateWidgetStyle();
            _this.setupMapIcons();
            _this.setupMap("apm");
        }
        else {
            $(_this.options.containerSelector).html(baseHtmlWithFilters);
            _this.calculateWidgetStyle();
            _this.setupMapIcons();
            _this.setupMap("all");
        }
    }
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
    Widget.prototype.setupMap = function (filter) {
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
        if (filter == "apm") {
            this.getPudoPoints("apm");
        }
        else if (filter == "sg") {
            this.getPudoPoints("sg");
        }
        else {
            this.getPudoPoints("all");
        }
    };
    Widget.prototype.setupMapIcons = function () {
        var icon = Widget.instance.options.pinIcon;
        var pins = Widget.instance.testPins;
        if (!icon || icon == 'null') {
            for (var i = 0; i < pins.length; i++) {
                if (pins[i].PointType > 50) {
                    icon = Widget.instance.env.assetsUrl + "/apmPin.svg";
                }
                else {
                    icon = Widget.instance.env.assetsUrl + "/sgPin.svg";
                }
            }
        }
        this.smallIcon = new L.Icon({
            iconSize: [50, 56],
            iconAnchor: [15, 36],
            popupAnchor: [10, 12],
            iconUrl: icon
        });
    };
    Widget.prototype.getPudoPoints = function (filter) {
        if (Widget.instance.options.configurationMode || !Widget.instance.options.key) {
            if (filter == "apm") {
                this.pins = this.testPins.filter(e => e.PointType > 50);
            }
            else if (filter == "sg") {
                this.pins = this.testPins.filter(e => e.PointType < 50);
            }
            else {
                this.pins = this.testPins;
            }
            this.showPudoPoints();
            return;
        }
        else {
            this.populatePudoPoints(filter);
        }
    }
    Widget.prototype.populatePudoPoints = async function (filter) {
        if (this.allPins == undefined) {
            this.allPins = await this.fetchPudoPoints();
        }
        if (filter == "apm") {
            this.pins = this.allPins.filter(e => e.PointType > 50);
        }
        else if (filter == "sg") {
            this.pins = this.allPins.filter(e => e.PointType < 50);
        }
        else {
            this.pins = this.allPins;
        }
        this.showPudoPoints();
    };
    Widget.prototype.fetchPudoPoints = function () {
        return new Promise((resolve, reject) => {
            fetch("/catalog/view/javascript/cargus/locations/pudo_locations.json", {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                },
                cache: 'no-cache'
            })
                .then(function (response) { return response.json(); })
                .then(function (json) {
                    $.ajax({
                        type: "GET",
                        url: "index.php?route=extension/module/cargus_ship/cron",
                        cache: false,
                        async: true,
                        success: function(data) {
                        },
                        error: function(data) {
                        }
                    });

                    resolve(json);

                });
        })
    }
    Widget.prototype.showPudoPoints = function () {
        var _this = this;
        this.markers = L.layerGroup().addTo(this.map);
        for (var i = 0; i < this.pins.length; i++) {
            if (this.pins[i].PointType > 50) {
                this.smallIcon.iconUrl = Widget.instance.env.assetsUrl + "/apmPin.svg";
                this.smallIcon.options.iconUrl = Widget.instance.env.assetsUrl + "/apmPin.svg";
            }
            else {
                this.smallIcon.iconUrl = Widget.instance.env.assetsUrl + "/sgPin.svg";
                this.smallIcon.options.iconUrl = Widget.instance.env.assetsUrl + "/sgPin.svg";
            }
            $('#cwmp-locations-list').append(this.getListItemContent(this.pins[i]));
            this.markers
                .addLayer(L.marker([this.pins[i].Latitude, this.pins[i].Longitude], { key: this.pins[i].Id, icon: this.smallIcon })
                    .addTo(this.map)
                    .on('click', function (e) {
                        var latLng = e.latlng;
                        _this.markers.eachLayer(function (layer) {
                            if (layer.getLatLng() == latLng) {
                                _this.markerClicked(layer.options.key, layer);
                            }
                        });
                    }));
        }
        this.map.addLayer(this.markers);
        if (Widget.instance.options.selectedLocationId) {
            var location_1 = this.pins.find(function (p) { return p.Id == Widget.instance.options.selectedLocationId; });
            if (location_1) {
                this.scrollToItem(Widget.instance.options.selectedLocationId);
                this.map.setView([location_1.Latitude, location_1.Longitude], Widget.instance.options.selectedZoomLevel);
                this.markers.eachLayer(function (layer) {
                    if (location_1.Id == layer.options.key) {
                        Widget.instance.markerClicked(layer.options.key, layer);

                    }
                });
            }
        }
        $('.cwmp-loader-backdrop').hide();
    };
    Widget.prototype.getListItemContent = function (location) {
        var content = '<li id="' + location.Id + '" class="cwmp-location-item" onclick="Widget.instance.locationSelected(this)" data-id="' + location.Id + '" data-name="' + location.Name + '" data-address="' + location.Address + '" data-latitude="' + location.Latitude + '" data-longitude="' + location.Longitude + '">';
        //#region first section - icon, title, address and image
        content += '<div class="cwmp-location">';
        //#region Ship and go or Locker icon
        content += '<div class="cwmp-location-icon-container">';
        if (location.PointType > 50) {
            content += "<img src=\"" + Widget.instance.env.assetsUrl + "/apmLogo.svg\" alt=\"" + location.Name + '"  />';
        }
        else {
            content += "<img src=\"" + Widget.instance.env.assetsUrl + "/shipgoLogo.svg\" alt=\"" + location.Name + '"  />';
        }
        content += '</div>'; //cwmp-location-icon-container
        //#endregion
        //#region title and address
        content += '<div class="cwmp-location-details">';

        content += '<div class="cwmp-location-title">' + location.Name + '</div>';
        content += '<div class="cwmp-location-address">';
        content += this.buildAddress(location);
        content += '<br>';
        content += '</div>'; //cwmp-location-address
        content += '</div>'; //cwmp-location-details
        //#endregion
        //#region main picture
        content += '<div class="cwmp-popup-location-details">';
        if (location.MainPicture) {
            content += '<img src="' + location.MainPicture + '" class="cwmp-popup-location-image" onclick="Widget.instance.showMore(' + location.Id + ')"/>';
        }
        else {
            content +=
                '<div class="cwmp-no-picture">\n <img src="' + Widget.instance.env.assetsUrl + '/logo.png" alt="' + location.Name + '" class="cwmp-location-no-picture" onclick="Widget.instance.showMore(' + location.Id + ')">\n  </div>';
        }
        content += '</div>';
        //#endregion
        content += '</div>'; //cwmp-location
        //#endregion
        //#region second section - work time and payment types
        //#region work time
        content += '<div class="cwmp-location-work-hours">';
        content += this.calculateWorkTime(location);
        content += '</div>';
        //#endregion work time

        //#region payment types
        content += '<div class="cwmp-location-work-hours cwmp-payment-types">';
        content += 'Modalitati de plata: ';
        content += this.getPaymentType(location.AcceptedPaymentType);
        content += '</div>';
        //#endregion
        //#endregion
        //#region third section - directions and more info

        content += '<div class="cwmp-location-work-hours">';
        content += '<div style="display: flex;">';

        //#region get directions
        content += '<button type="button" class="directions-image-button" onclick="Widget.instance.openGoogleMaps(' + location.Latitude + ' , ' + location.Longitude + ')">';
        content += '<div class ="directions-image-div"> <img src="' + Widget.instance.env.assetsUrl + '/directions_icon.svg" alt="' + location.Name + '"  /> </div>';
        content += '<div class="directions-image-text"> Vezi traseul </div></button> ';
        //#endregion
        //#region more info
        content += '<button class="directions-image-button" onclick="Widget.instance.showMore(' + location.Id + ')">';
        content += '<div class ="directions-image-div"> <img src="' + Widget.instance.env.assetsUrl + '/icon-info-circle.svg" alt="afla mai multe"  /> </div>';
        content += '<div class="directions-image-text"> Vezi detalii </div></button> ';
        //#endregion
        content += '</div>';

        content += '</div>';
        //#endregion

        if (Widget.instance.options.showChooseButton) {
            content += '<div class="cwmp-choose-point-container">';
            content += '<button class="cwmp-search-button" onclick="Widget.instance.choosePoint(event, ' + location.Id + ')">ALEGE OPTIUNEA</button>';
            content += '</div>';
        }

        content += '</li>';
        return content;
    };
    Widget.prototype.calculateWorkTime = function (location) {

        var listOfDays = [];
        listOfDays.push(getDayOpenHours("Luni", location.OpenHoursMoStart, location.OpenHoursMoEnd));
        listOfDays.push(getDayOpenHours("Marti", location.OpenHoursTuStart, location.OpenHoursTuEnd));
        listOfDays.push(getDayOpenHours("Miercuri", location.OpenHoursWeStart, location.OpenHoursWeEnd));
        listOfDays.push(getDayOpenHours("Joi", location.OpenHoursThStart, location.OpenHoursThEnd));
        listOfDays.push(getDayOpenHours("Vineri", location.OpenHoursFrStart, location.OpenHoursFrEnd));
        listOfDays.push(getDayOpenHours("Sambata", location.OpenHoursSaStart, location.OpenHoursSaEnd));
        listOfDays.push(getDayOpenHours("Duminica", location.OpenHoursSuStart, location.OpenHoursSuEnd));

        //#region algorithm to display working hours

        var result = '';
        var firstIntervalDay = undefined;
        var lastIntervalDay = undefined;
        listOfDays.forEach(function (day) {
            if (firstIntervalDay == undefined) {
                firstIntervalDay = day;
            }

            if (lastIntervalDay == undefined) {
                lastIntervalDay = day;
            }

            if (firstIntervalDay.Interval != day.Interval) {

                result += getOpenHours(firstIntervalDay, lastIntervalDay);
                firstIntervalDay = day;
                lastIntervalDay = day;
            }
            else {
                lastIntervalDay = day;
            }
        });
        //for last day
        result += getOpenHours(firstIntervalDay, lastIntervalDay);

        //#endregion

        return result;
    };

    Widget.prototype.buildAddress = function (location) {
        var address = location.StreetName + ' ' + (location.StreetNo ? location.StreetNo : '') + '<br />';
        address += location.City + ' ' + (location.PostalCode ? location.PostalCode : '');

        if (location.PointType > 50) {
            address += location.AdditionalAddressInfo ? '<br />' + location.AdditionalAddressInfo : '';
        }

        return address;
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
            Widget.instance.geocoder.search({ query: text }).then(function (result) {
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
    Widget.prototype.searchAddressInPudoList = function () {
        var text = $('#searchInput').val();
        $('#searchResults').empty();
        Widget.instance.oldSearch = text;
        var pins = Widget.instance.pins;
        var result1 = pins.filter(f => f.Name.toLowerCase().includes(text.toLowerCase()) || f.Address.toLowerCase().includes(text.toLowerCase()));

        Widget.instance.searchItems = result1;
        if (result1.length > 0) {
            $('.cwmp-search-results-container').show();
        }
        else {
            $('.cwmp-search-results-container').hide();
        }
        for (var i = 0; i < result1.length; i++) {
            $('#searchResults').append(Widget.instance.getSearchPudoListItem(result1[i]));
        }
    };
    Widget.prototype.getSearchItem = function (item) {
        var content = '<li id="' + item.raw.osm_id + '" class="cwmp-search-item" data-id="' + item.raw.osm_id + '" onclick="Widget.instance.showSearchLocation(' + item.y + ',' + item.x + ',' + item.raw.osm_id + ')">';
        content += '<span> <div class="cwmp-list-icon"> <img src=\"' + Widget.instance.env.assetsUrl + '/icon-address-pin.svg\" class=\"cwmp-ship-go-icon-list\" />' + item.label + '</span></li>';

        return content;
    };
    Widget.prototype.getSearchPudoListItem = function (item) {
        var content = '<li id="' + item.Id + '" class="cwmp-search-item" data-id="' + item.Id + '" onclick="Widget.instance.showSearchLocation(' + item.Latitude + ',' + item.Longitude + ',' + item.Id + ')">';
        if (item.PointType > 50) {
            content += '<span> <div class="cwmp-list-icon"> <img src=\"' + Widget.instance.env.assetsUrl + '/apmLogo.svg\" class=\"cwmp-ship-go-icon-list\" /> <b>' + item.Name + ' </b> </div> ' + item.Address + '</span></li>';
        }
        else {
            content += '<span> <div class="cwmp-list-icon"> <img src=\"' + Widget.instance.env.assetsUrl + '/shipgoLogo.svg\" class=\"cwmp-ship-go-icon-list\" /> <b>' + item.Name + ' </b> </div> ' + item.Address + '</span></li>';
        }
        return content;
    };
    Widget.prototype.showSearchLocation = function (lat, lon, id) {
        Widget.instance.selectedSearchItem = id;
        this.selectSearchItem(id);
        var wasClicked = false;
        Widget.instance.markers.eachLayer(function (layer) {
            if (layer.getLatLng().lat == lat && layer.getLatLng().lng == lon ) {
                Widget.instance.markerClicked(id, layer);
                wasClicked = true;
            }
        });
        if (wasClicked == false) {
            Widget.instance.map.setView([lat, lon], Widget.instance.options.selectedZoomLevel);
        }
    };
    Widget.prototype.highlightSearchItem = function (id) {
        var items = $('.cwmp-search-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('cwmp-highlited');
        }
        $('#' + id)[0].classList.add('cwmp-highlited');
    };
    Widget.prototype.selectSearchItem = function (id) {
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
    };
    Widget.prototype.navigateTo = function (id) {
        var searchLocation = Widget.instance.searchItems.find(function (s) { return s.raw.osm_id == id; });
        this.selectSearchItem(id);
        Widget.instance.map.setView([searchLocation.y, searchLocation.x], Widget.instance.options.selectedZoomLevel);
    };
    Widget.prototype.onKeyUp = function (event) {
        if (event.key == 'Enter') {
            Widget.instance.searchAddress();
            Widget.instance.searchAddressInPudoList();
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
        var distanceValue = $('#selectedDistance').val();
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
    Widget.prototype.markerClicked = function (id, layer) {

        //#region handle pins

        //#region reset last clicked point on map image
        if (lastClickedLeaf != undefined && lastClickedLeaf._icon != undefined && lastClickedLeaf._icon.currentSrc != undefined) {
            var oldImage = undefined;
            var currentImage = lastClickedLeaf._icon.currentSrc;

            if (currentImage.includes("/apmSelectedPin.svg")) {
                oldImage = Widget.instance.env.assetsUrl + "/apmPin.svg";
            }
            else if (currentImage.includes("/shipAndGoSelectedPin.svg")) {
                oldImage = Widget.instance.env.assetsUrl + "/sgPin.svg";
            }
            if (oldImage != undefined) {
                var oldImageIcon = new L.Icon({
                    iconSize: [50, 56],
                    iconAnchor: [15, 36],
                    popupAnchor: [10, 12],
                    iconUrl: oldImage
                });
                lastClickedLeaf.setIcon(oldImageIcon);
            }

        }

        //#endregion

        //#region set new image



        if (layer != undefined && layer._icon != undefined && layer._icon.currentSrc != undefined) {
            var currentImage = layer._icon.currentSrc;
            var newImage = undefined;

            if (currentImage.includes("/apmPin.svg")) {
                newImage = Widget.instance.env.assetsUrl + "/apmSelectedPin.svg";
            }
            else if (currentImage.includes("/sgPin.svg")) {
                newImage = Widget.instance.env.assetsUrl + "/shipAndGoSelectedPin.svg";
            }
            if (newImage != undefined) {
                var newImageIcon = new L.Icon({
                    iconSize: [80, 86],
                    iconAnchor: [30, 50],
                    popupAnchor: [10, 12],
                    iconUrl: newImage
                });
                layer.setIcon(newImageIcon);
            }
        }
        //#endregion

        //#region set last clicked leaf
        lastClickedLeaf = layer;
        //#endregion

        if (layer != undefined && layer.getLatLng() != undefined) {
            Widget.instance.map.setView([layer.getLatLng().lat, layer.getLatLng().lng], Widget.instance.options.closeZoomLevel);
        }

        //#endregion

        var items = $('.cwmp-location-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('cwmp-highlighted');
            $(items[i]).find('.cwmp-location-work-hours').hide();
            $(items[i]).find('.cwmp-choose-point-container').hide();
        }
        Widget.instance.options.selectedLocationId = id;
        $('#' + id)[0].classList.add('cwmp-highlighted');
        $('#' + id).find('.cwmp-location-work-hours').show();
        $('#' + id).find('.cwmp-choose-point-container').show();
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
            $(items[i]).find('.cwmp-choose-point-container').hide();
        }
        Widget.instance.options.selectedLocationId = id;
        ct[0].classList.add('cwmp-highlighted');
        $(ct[0]).find('.cwmp-location-work-hours').show();
        $(ct[0]).find('.cwmp-choose-point-container').show();
        Widget.instance.markers.eachLayer(function (layer) {
            if (id == layer.options.key) {
                Widget.prototype.markerClicked(layer.options.key, layer);
            }
        });
    };
    Widget.prototype.choosePoint = function (event, id) {
        event.stopPropagation();
        var location = Widget.instance.pins.find(function (p) { return p.Id == id; });
        Widget.instance.onChanged(location);
    };
    Widget.prototype.showMore = function (id) {
        var location = Widget.instance.pins.find(function (l) { return l.Id == id; });
        if (!location) {
            return;
        }
        var c = '<div class="cwmp-more-popup-container">';
        c += '<div class="cwmp-more-popup-location-details">';
        c += '<div class="cwmp-more-popup-close">';
        c += '<button class="cwmp-more-popup-close-button" onclick="Widget.instance.closeMore()">x</button>';
        c += '</div>';
        if (location.MainPicture) {
            c += '<img src="' + location.MainPicture + '" class="cwmp-more-popup-location-image" />';
        }
        else {
            c += "<img src=\"" + Widget.instance.env.assetsUrl + "/cargus.svg\" class=\"cwmp-more-popup-location-image\" />";
        }

        if (location.AddressDescription != undefined) {
            c += '<div class="cwmp-more-popup-location-description">';
            c += location.AddressDescription;
            c += '</div>';

        }

        c += '</div>';
        c += '</div>';
        $('#morePopup').show();
        $('#morePopupContent').empty();
        $('#morePopupContent').append(c);
    };
    Widget.prototype.closeMore = function () {
        $('#morePopup').hide();
    };
    Widget.prototype.closeSearchAddressAndPudo = function () {
        $('.cwmp-search-results-container').hide();
    };
    Widget.prototype.calculateMoreWorkTime = function (start, end) {
        if (start && end) {
            return start + "-" + end;
        }
        return 'closed';
    };
    Widget.prototype.getPaymentType = function (paymentType) {
        var paymentString = '';
        if (paymentType.Cash) {
            paymentString = '<img class="payment-type-result-icon" src=' + Widget.instance.env.assetsUrl + '/cash_pay_icon.svg alt="Numerar"/> Numerar';
        }
        if (paymentType.Card) {
            paymentString += '<img class="payment-type-result-icon" src=' + Widget.instance.env.assetsUrl + '/card_pay_icon.svg alt="Numerar"/> Card';
        }
        if (paymentType.Online) {
            paymentString += '<img class="payment-type-result-icon" src=' + Widget.instance.env.assetsUrl + '/online_pay_icon.svg alt="Numerar"/> Online';

        }
        if (!paymentType.Cash && !paymentType.Card && !paymentType.Online) {
            paymentString = 'Fara Plata';
        }

        paymentString = '<div class="payment-type-result">' + paymentString + '</div>'
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
        return "\n            <script src=\"" + widgetOptions.apiUrl + "/widget.js?v=1\"></script>\n            <div id=\"" + widgetOptions.containerSelector.substring(1, widgetOptions.containerSelector.length) + "\"></div>\n            <script>\n                (function() {\n                    // Setup map\n                    var widget = new Widget({\n                        key: '" + widgetOptions.key + "',\n                        initialPosition: {\n                            latitude: '" + widgetOptions.initialPosition.latitude + "',\n                            longitude: '" + widgetOptions.initialPosition.longitude + "'\n                        },\n                        selectedLocationId: null,\n                        mapSelector: '" + widgetOptions.mapSelector + "',\n                        containerSelector: '" + widgetOptions.containerSelector + "',\n                        width: '" + widgetOptions.width + "',\n                        height: '" + widgetOptions.height + "',\n                        zoomEnabled: '" + widgetOptions.zoomEnabled + "',\n                        defaultZoomLevel: '" + widgetOptions.defaultZoomLevel + "',\n                        pinIcon: '" + widgetOptions.pinIcon + "',\n                        lang: '" + widgetOptions.lang + "',\n                        widgetSize: '" + widgetOptions.widgetSize + "',\n                        apiUrl: '" + widgetOptions.apiUrl + "',\n                        showChooseButton: " + widgetOptions.showChooseButton + ",\n                        showOnlyShipGo: " + widgetOptions.showOnlyShipGo + ",\n                        showOnlyApm: " + widgetOptions.showOnlyApm + ",\n                        style: {\n                            font: '" + widgetOptions.style.font + "',\n                            backgroundColor: '" + widgetOptions.style.backgroundColor + "',\n                            textColor: '" + widgetOptions.style.textColor + "',\n                            spinnerColor: '" + widgetOptions.style.spinnerColor + "',\n                            sidebar: {\n                                buttonTextColor: '" + widgetOptions.style.sidebar.buttonTextColor + "',\n                                buttonTextHoverColor: '" + widgetOptions.style.sidebar.buttonTextHoverColor + "',\n                                buttonBackgroundColor: '" + widgetOptions.style.sidebar.buttonBackgroundColor + "',\n                                buttonBackgroundHoverColor: '" + widgetOptions.style.sidebar.buttonBackgroundHoverColor + "',\n                                \n                                pudoItemTextColor: '" + widgetOptions.style.sidebar.pudoItemTextColor + "',\n                                pudoItemBackgroundColor: '" + widgetOptions.style.sidebar.pudoItemBackgroundColor + "',\n                                pudoItemTextHoverColor: '" + widgetOptions.style.sidebar.pudoItemTextHoverColor + "',\n                                pudoItemBackgroundHoverColor: '" + widgetOptions.style.sidebar.pudoItemBackgroundHoverColor + "',\n\n                                pudoItemSelectedTextColor: '" + widgetOptions.style.sidebar.pudoItemSelectedTextColor + "',\n                                pudoItemSelectedBackgroundColor: '" + widgetOptions.style.sidebar.pudoItemSelectedBackgroundColor + "',\n                                pudoItemSelectedButtonTextColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonTextColor + "',\n                                pudoItemSelectedButtonBackgroundColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonBackgroundColor + "',\n                                pudoItemSelectedButtonTextHoverColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonTextHoverColor + "',\n                                pudoItemSelectedButtonBackgroundHoverColor: '" + widgetOptions.style.sidebar.pudoItemSelectedButtonBackgroundHoverColor + "'\n                            },\n                            popup: {\n                                backgroundColor: '" + widgetOptions.style.popup.backgroundColor + "',\n                                mainTextColor: '" + widgetOptions.style.popup.mainTextColor + "',\n                                detailsTextColor: '" + widgetOptions.style.popup.detailsTextColor + "',\n                                buttonTextColor: '" + widgetOptions.style.popup.buttonTextColor + "',\n                                buttonBackgroundColor: '" + widgetOptions.style.popup.buttonBackgroundColor + "',\n                                buttonTextHoverColor: '" + widgetOptions.style.popup.buttonTextHoverColor + "',\n                                buttonBackgroundHoverColor: '" + widgetOptions.style.popup.buttonBackgroundHoverColor + "',\n                            }\n                        }\n                    });\n                    widget.init();\n                    widget.onChanged = function(location) {\n                        // Location selection changed\n                    };\n                })();\n            </script>";
    };
    Widget.prototype.filterChanged = function (el, selector) {
        Widget.instance.options[selector] = el.checked;
        Widget.instance.options["showFilters"] = true;
        if (selector == el.id) {
            if (el.checked) {
                baseHtmlWithFilters = baseHtmlWithFilters.replace("id=\"" + el.id + "\"", "id=\"" + el.id + "\" checked");
                Widget.instance.options[el.id] = true;
            }
            else {
                baseHtmlWithFilters = baseHtmlWithFilters.replace("id=\"" + el.id + "\" checked", "id=\"" + el.id + "\"");
                Widget.instance.options[el.id] = false;
            }
        }
        Widget.instance.options.initialPosition = { latitude: Widget.instance.map.getCenter().lat, longitude: Widget.instance.map.getCenter().lng };
        Widget.instance.options.selectedZoomLevel = Widget.instance.map.getZoom();
        Widget.instance.options.defaultZoomLevel = Widget.instance.map.getZoom();
        Widget.instance.redraw();
    };

    return Widget;
}());
var baseHtml =              "\n    <div class=\"cwmp-widget-container\">\n        <div class=\"cwmp-widget-sidebar\">\n            <div class=\"cwmp-loader-backdrop\">\n                <div class=\"cwmp-loader\">\n                </div>\n            </div>\n            <div class=\"cwmp-sidebar-header-wrap\">\n                <div class=\"cwmp-sidebar-header-text\">\n               </div>\n                <div class=\"cwmp-sidebar-search-section\">\n                    <div class=\"search-input-container\">\n                        <input id=\"searchInput\" onkeyup=\"Widget.instance.onKeyUp(event)\"\n                            onkeydown=\"Widget.instance.onKeyDown(event)\"\n                            placeholder=\"Adresa, Ship&Go, locker...\" class=\"cwmp-search-input\" />\n                    </div>\n                    <div class=\"cwmp-search-distance\">\n                        <select id=\"selectedDistance\" class=\"cwmp-search-input\" onchange=\"Widget.instance.zoomChanged()\">\n                            <option value=\"1\">1</option>\n                            <option value=\"3\">3</option>\n                            <option value=\"5\">5</option>\n                            <option value=\"10\">10</option>\n                        </select>\n                        <span class=\"cwmp-distance-km\">\n                            km\n                        </span>\n                    </div>\n           <div id=\"cwmp-filters-section\"></div>         <div class=\"cwmp-search-button-container\">\n                        <button class=\"cwmp-search-button\" onclick=\"Widget.instance.searchAddress(); Widget.instance.searchAddressInPudoList()\">CAUTA</button>\n                    </div>\n                </div>\n                <div class=\"cwmp-search-results-container\">\n                    <h3 class=\"close-search-x\" onclick=\"Widget.instance.closeSearchAddressAndPudo()\">X</h3>\n                    <ul class=\"cwmp-search-results\" id=\"searchResults\">\n\n                    </ul>\n                </div>\n                <hr class=\"cwmp-sidebar-separator\" />\n            </div>\n            <div class=\"cwmp-sidebar-locations-container\">\n                <div class=\"cwmp-sidebar-locations-title\">\n               </div>\n                <div class=\"sidebar-locations\">\n                    <ul id=\"cwmp-locations-list\" class=\"cwmp-sidebar-locations-list\">\n                    </ul>\n                </div>\n            </div>\n        </div>\n        <div class=\"cwmp-widget-map\">\n            <div id=\"map\"></div>\n        </div>\n\n        <div id=\"morePopup\">\n            <div class=\"cwmp-more-wrapper\">\n                <div class=\"cwmp-widget-more-popup-backdrop\" onclick=\"Widget.instance.closeMore()\">\n                </div>\n                <div id=\"morePopupContent\" class=\"cwmp-widget-more-popup\">\n                </div>\n            </div>\n        </div>\n    </div>\n";
var baseHtmlWithFilters = baseHtml.replace("<div id=\"cwmp-filters-section\"></div>", "<div class=\"cwmp-filters\">\n        <label class=\"cwmp-filter-checkbox\" for=\"shipgo\">\n <input type =\"checkbox\" id=\"showOnlyShipGo\" checked onchange=\"Widget.prototype.filterChanged(this, 'showOnlyShipGo')\">\n Ship & Go</label>\n                            <label class=\"cwmp-filter-checkbox\" for=\"apm\">\n <input type =\"checkbox\" id=\"showOnlyApm\" checked onchange=\"Widget.prototype.filterChanged(this, 'showOnlyApm')\">\n Cargus Lockers</label><br>\n				</div >\n         ");
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
        this.containerSelector = '#widget';
        this.width = 1000;
        this.height = 600;
        this.zoomEnabled = false;
        this.defaultZoomLevel = 14;
        this.selectedZoomLevel = 14;
        this.closeZoomLevel = 16;
        this.lang = 'EN';
        this.configurationMode = false;
        this.showChooseButton = true;
        this.showOnlyShipGo = true;
        this.showOnlyApm = true;
        this.showFilters = true;
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

var lastClickedLeaf = undefined;

//#region helpers for open hours

var getDayOpenHours = function (dayName, start, end) {

    var interval = '<div class="workinghours-interval">' + start + '-' + end + '</div>';
    if (start == undefined || end == undefined || start == null || end == null || start == '' || end == '') {
        interval = '<div class="workinghours-interval-closed"> Inchis </div>';
    }

    var dayInterval = {
        Day: dayName,
        Interval: interval
    };
    return dayInterval;

}

var getOpenHours = function (firstIntervalDay, lastIntervalDay) {

    var result = '';
    //same day
    if (firstIntervalDay.Day == lastIntervalDay.Day) {
        result = firstIntervalDay.Day + ': ' + firstIntervalDay.Interval + '<br/>';
    }
    //two different days
    else {
        result = firstIntervalDay.Day + ' - ' + lastIntervalDay.Day + ': ' + firstIntervalDay.Interval + '<br/>';
    }

    return result;

}

//#endregion