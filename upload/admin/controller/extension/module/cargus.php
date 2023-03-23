<?php

class ControllerExtensionModuleCargus extends Controller
{
    public function columnLeftBefore($route, &$args)
    {
        $this->load->language('extension/shipping/cargus');

        $cargus = array();
        $cargusShip = array();

        $userToken = 'user_token=' . $this->session->data['user_token'];

        $cargus[] = array(
            'name'     => $this->language->get('text_cargus_comanda'),
            'href'     => $this->url->link(
                'extension/cargus/comanda',
                $userToken,
                true
            ),
            'children' => array()
        );

        $cargus[] = array(
            'name'     => $this->language->get('text_cargus_istoric'),
            'href'     => $this->url->link(
                'extension/cargus/istoric',
                $userToken,
                true
            ),
            'children' => array()
        );

        $cargus[] = array(
            'name'     => $this->language->get('text_cargus_preferinte'),
            'href'     => $this->url->link(
                'extension/cargus/preferinte',
                $userToken,
                true
            ),
            'children' => array()
        );

        $cargus[] = array(
            'name'     => $this->language->get('text_cargus_setari'),
            'href'     => $this->url->link(
                'extension/shipping/cargus',
                $userToken,
                true
            ),
            'children' => array()
        );

        if ($cargus) {
            $args['menus'][] = array(
                'id'       => 'menu-extension',
                'icon'     => 'fa-truck',
                'name'     => $this->language->get('text_cargus_index'),
                'href'     => '',
                'children' => $cargus
            );
        }

        $cargusShip[] = array(
            'name'     => $this->language->get('text_cargus_ship_and_go_preferinte'),
            'href'     => $this->url->link(
                'extension/cargus/ship_and_go',
                $userToken,
                true
            ),
            'children' => array()
        );

        if ($cargusShip) {
            $args['menus'][] = array(
                'id'       => 'menu-extension',
                'icon'     => 'fa-truck',
                'name'     => $this->language->get('text_cargus_ship_and_go_index'),
                'href'     => '',
                'children' => $cargusShip
            );
        }
    }

    public function orderListAfter($route, &$args, &$output)
    {
        $this->load->language('module/cargus');

        $search = '<div class="pull-right">';

        $replace = $search .
                   '<span token="'.$this->session->data['user_token'].'" id="add_cargus" class="btn btn-info">'.
                   $this->language->get('add_to_cargus').'</span>';

        $output = str_ireplace($search, $replace, $output);

        return null;
    }

    public function orderInfoBefore($route, &$args)
    {
        $orderInfo['order_id'] = $args['order_id'];

        $args['shipping_method_cargus'] = $this->load->controller('extension/shipping/cargus/info', $orderInfo);

        return null;
    }

    public function orderInfoAfter($route, &$args, &$output)
    {
        $textInvoice = $this->language->get('text_invoice');

        $shippingMethodCargus = $args['shipping_method_cargus'];

        $content = '';

        if (!empty($shippingMethodCargus)) {
            if (!isset($shippingMethodCargus['awb_number'])) {
                $content .= '<td class="text-left">Cargus AWB</td>
                    <td class="text-center"></td>
                    <td class="text-right">
                    <a href="'.$shippingMethodCargus['buttonAddAwbLink'].'"
                    data-toggle="tooltip"
                    title="'.$shippingMethodCargus['buttonAddAwb'].'"
                    class="btn btn-success btn-xs"><i class="fa fa-plus-circle"></i></a>
                    </td>
                ';
            } else {
                $content .= '
                    <td class="text-left">
                    <strong>Cargus AWB</strong>&nbsp;&nbsp;
                    <a href="'.$shippingMethodCargus['buttonShowAwbHistory'].'">
                    '.$shippingMethodCargus['awb_number'].'
                    </a>
                    </td>
                    <td class="text-center"></td>
                    <td class="text-right">
                    <a href="'.$shippingMethodCargus['buttonShowAwbPdf'].'"
                    target="_blank"
                    data-toggle="tooltip"
                    title="'.$shippingMethodCargus['buttonShowAwb'].'"
                    class="btn btn-info btn-xs"><i class="fa fa-print"></i></a>
                    </td>
                ';
            }

            $content .= '</tr><tr>';
        }

        $search = '<td>' . $textInvoice . '</td>';

        $replace = $content . $search;

        $output = str_ireplace($search, $replace, $output);

        if (isset($args['shipping_method_cargus']['ReturnCode']) || isset($args['shipping_method_cargus']['ReturnAwb'])) {
            $returnCode = $args['shipping_method_cargus']['ReturnCode'];
            $returnAwb = $args['shipping_method_cargus']['ReturnAwb'];

            switch ($this->config->get('cargus_preferinte_awb_retur')) {
                case 1:
                    //voucher
                    $showQr = $returnCode;
                    $showText = 'Voucher retur comanda';
                    break;

                default:
                    //awb return
                    $showQr = $returnAwb;
                    $showText = 'AWB retur comanda';
                    break;
            }

            $search = '/<div class="panel panel-default">\s+<div class="panel-heading">\s+<h3 class="panel-title"><i class="fa fa-info-circle"><\/i>/mi';
            $searchText = '<div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title"><i class="fa fa-info-circle"></i>';

            $content = '<div class="panel panel-default">';
                $content .= '<div class="panel-heading">';
                $content .= '<h3 class="panel-title">';
                $content .= '<i class="fa fa-info-circle"></i>Cargus';
                $content .= '</h3>';
                $content .= '</div>';

                $content .= '<div class="panel-body">';
                $content .= $showText.': <br>';
                $content .= $showQr;
            $content .= '<div id="qrcode-container"></div>
<script src="view/javascript/qrcode.js"></script>
<script>	
	var opts = {
  errorCorrectionLevel: \'H\',
  type: \'image/jpeg\',
  quality: 0.3,
  margin: 2,
  scale: 4,
  width: 128,
  color: {
    dark:"#000000ff",
    light:"#ffffffff"
  }
}

QRCode.toDataURL(\''.$showQr.'\', opts, function (err, url) {
  if (err) throw err

  
  let img = document.createElement(\'img\');
	img.alt = \'QRCode\';
	img.src = url
	
	document.getElementById(\'qrcode-container\').appendChild(img);
})
</script>';
                $content .= '</div>';

            $content .= '</div>';

            $replace = $content . $searchText;

            $output = preg_replace($search, $replace, $output);
        }

        return null;
    }

    public function commonHeaderAfter($route, &$args, &$output)
    {
        //add in header
        $content = '<link rel="stylesheet" type="text/css" href="view/stylesheet/cargus.css" />
            <script type="text/javascript" src="view/javascript/cargus/cargus.js"></script>';

        $search = '</head>';

        $replace = $content . $search;

        $output = str_ireplace($search, $replace, $output);

        return null;
    }

    public function permissionBefore($route, &$args)//, &$output)
    {
        $this->log->write(__CLASS__.'::'.__FUNCTION__);
        $this->log->write($route);
        $this->log->write(print_r($args, true));

//        $output .= '<div style="position: relative; z-index: 999;color:red;">TESTTTTT</div>';

//        $this->log->write($output);

//        return null;
    }
}
