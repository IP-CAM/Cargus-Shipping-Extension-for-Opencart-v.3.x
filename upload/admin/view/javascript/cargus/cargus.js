$(function () {
    $('#add_cargus').click(function () {
        $('.add_status').remove();
        var token = $(this).attr('token');
        if ($('input[name="selected[]"]:checked').length == 0) {
            $('.breadcrumb').after('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Va rugam sa selectati cel putin o comanda!<button type="button" class="close" data-dismiss="alert">×</button></div>');
        } else {
            var add = 0;
            var err = 0;
            $('input[name="selected[]"]:checked').each(function () {
                var id = parseInt($(this).val());
                $.ajax({
                    async: false,
                    url: 'index.php?route=extension/shipping/cargus/add&user_token=' + token + '&id=' + id + '&rand=' + makeid(),
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
                $('.breadcrumb').after('<div class="alert alert-success"><i class="fa fa-exclamation-circle"></i> ' + add + ' comenzi au fost adaugate in expeditia curenta Cargus!<button type="button" class="close" data-dismiss="alert">×</button></div>');
            }
            if (err > 0) {
                $('.breadcrumb').after('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + err + ' comenzi nu au putut fi adaugate in expeditia curenta Cargus!<button type="button" class="close" data-dismiss="alert">×</button></div>');
            }
        }
        return false;
    });

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
});