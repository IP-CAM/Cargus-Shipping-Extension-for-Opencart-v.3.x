$(function () {
    function do_replace() {
        var element = $('[name="city"]');

        var attr_name = element.attr('name');
        var attr_class = element.attr('class');
        var attr_id = element.attr('id');
        var maxlength = element.attr('maxlength');
        var data_validate = element.attr('data-validate');
        var value = element.val();

        if (element != null) {
            if ($('[name="id_country"]').val() == 36 && $('[name="id_state"]').val()) {
                $.post(cargus_url + 'index.php?fc=module&module=cargus&controller=city&judet=' + $('[name="id_state"]').val() + '&val=' + value, function (data) {
                    element.replaceWith('<select name="' + attr_name + '" class="' + attr_class + '" id="' + attr_id + '">' + data + '</select>');
                });
            } else {
                element.replaceWith('<input type="text" name="' + attr_name + '" class="' + attr_class + '" id="' + attr_id + '" maxlength="' + maxlength + '" data-validate="' + data_validate + '" value="" />');
            }
        }
    }

    $(document).on('change', '[name="id_state"]', function () {
        do_replace();
    });

    $(document).on('change', '[name="id_country"]', function () {
        do_replace();
    });

    do_replace();
});