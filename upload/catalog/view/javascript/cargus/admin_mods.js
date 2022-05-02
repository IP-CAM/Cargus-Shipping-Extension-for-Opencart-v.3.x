$(document).ready(function(){
    // Check prestashop version
    // For < 1.7.8 add the button as it is
    if (_PS_VERSION_.includes('1.7.8') ) {
        $('.card-header.js-grid-header').append('<button type="button" id="add_cargus_bulk" class="js-common_refresh_list-grid-action add_cargus_bulk text-right btn btn-action float-right pt-0"><i class="material-icons">library_add</i>Adauga in lista de livrari Cargus</button>');
    } else {
        // adauga buton submit in head-ul orders
        $('.dropdown-menu, .dropdown-menu-right').prepend('<button type="button" id="add_cargus_bulk" class="dropdown-item js-common_refresh_list-grid-action add_cargus_bulk"><i class="material-icons">library_add</i>Adauga in lista de livrari Cargus</button>');
    }

    $('.panel-heading-action').prepend('<div align="right" style="padding-right:3px; float:right;"><input style="height:27px;" type="button" class="button add_cargus_bulk" value="Adauga in lista de livrari Cargus" id="add_cargus_bulk2"></div>');

    // ruleaza ajax in loop pt adaugarea comenzilor selectate in lista de livrare
    $('.add_cargus_bulk').click( function () {
        if ($('[name="order_orders_bulk[]"]:checked').length == 0 &&
            $('[name="orderBox[]"]:checked').length == 0
        ) {
            alert('Va rugam sa selectati cel putin o comanda!');
        } else {
            var add = 0;
            var err = 0;
            var checked = null;

            if($('[name="order_orders_bulk[]"]:checked').length){
                checked = $('[name="order_orders_bulk[]"]:checked')
            } else {
                checked = $('[name="orderBox[]"]:checked')
            }

            checked.each(function () {
                var id = parseInt($(this).val());
                $.ajax({
                    async: false,
                    url: cargus_url + cargus_admindir + '/index.php?controller=CargusAdmin&token=' + cragus_token +'&type=ADDORDER&secret=' + secret + '&id=' + id + '&rand=' + Math.floor((Math.random() * 1000000) + 1),
                    success: function (data) {
                        if (data == 'ok') {
                            ++add;
                        } else {
                            ++err;
                        }
                    }
                });
            });

            if (add > 0) {
                alert(add + ' comenzi au fost adaugate in expeditia curenta Cargus!');
            }
            if (err > 0) {
                alert(err + ' comenzi nu au putut fi adaugate in expeditia curenta Cargus!');
            }
        }
        return false;
    });
});