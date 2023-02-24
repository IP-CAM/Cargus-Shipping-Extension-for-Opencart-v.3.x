<?php

class ControllerExtensionModuleCargus extends Controller
{
    public function journal3CheckoutSaveBefore($route, &$args)
    {
        $this->session->data['custom_field']['pudo_location_id'] = null;

        if (isset($this->request->post['order_data']['custom_field']['pudo_location_id'])) {
            $this->session->data['custom_field']['pudo_location_id'] = $this->request->post['order_data']['custom_field']['pudo_location_id'];
        }
    }

    public function journal3CheckoutAfter($route, &$args, &$output)
    {
        $output .= '<script type="text/javascript">window.onload = function(){cargusCheckShipping();};</script>';

        return null;
    }

    public function checkoutShippingMethodAfter($route, &$args, &$output)
    {
        $output .= '<script type="text/javascript">cargusCheckShipping();</script>';

        return null;
    }

    public function commonHeaderAfter($route, &$args, &$output)
    {
        $content = '<script type="text/javascript" src="catalog/view/javascript/cargus/cargus.js"></script>
            <link href="catalog/view/theme/default/stylesheet/ship_and_go.css" rel="stylesheet">
            <script type="text/javascript" src="catalog/view/javascript/cargus/ship_and_go.js"></script>
            ';

        $search = '</head>';

        $replace = $content . $search;

        $output = str_ireplace($search, $replace, $output);

        return null;
    }

    public function checkoutPaymentMethodAfter($route, &$args, &$output)
    {
        $output .= '<script type="text/javascript">checkPaymentMethod();</script>';
    }

    public function checkoutShippingMethodBefore($route, &$args)
    {
        $this->config->set('shipping_cargus_status', $this->config->get('cargus_status'));
    }

    public function carrierSaveAfter($route, &$args, &$output)
    {
        //check if ship&go is selected and a delivery point was selected
        $error_message = 'Va rugam selectati un punct Ship&Go';

        if ($this->session->data['shipping_method']['code'] == 'cargus_ship_and_go.ship_and_go' &&
            (
                isset($this->session->data['order_id']) ||
                !isset($this->session->data['shipping_address']['custom_field']['pudo_location_id'])
            )
        ) {
            $data = array();

            if (isset($this->session->data['order_id'])) {
                $order_id = $this->session->data['order_id'];

                $this->load->model('checkout/order');
                $data = $this->model_checkout_order->getOrder($order_id);
            }

            //journal3
            if (isset($this->session->data['custom_field']['pudo_location_id']) &&
                isset($this->session->data['j3_checkout_id']) &&
                isset($this->session->data['order_id']) &&
                $this->customer->isLogged()
            ) {
                $data['custom_field'] = $this->session->data['custom_field'];
                $order_id = $this->session->data['order_id'];

                //update order data
                $this->db->query("UPDATE `" . DB_PREFIX . "order` SET custom_field = '" . $this->db->escape(json_encode($data['custom_field'])) . "' WHERE order_id = '" . (int)$order_id . "'");
            }

            $is_journal3_check_ok = true;

            if (isset($this->session->data['j3_checkout_id']) &&
                isset($this->request->get['confirm']) &&
                $this->request->get['confirm'] !== true
            ) {
                $is_journal3_check_ok = false;
            }

            if (!isset($data['custom_field']['pudo_location_id']) &&
                !isset($data['shipping_custom_field']['pudo_location_id']) &&
                !isset($this->session->data['shipping_address']['custom_field']['pudo_location_id']) &&
                !$is_journal3_check_ok
            ) {
                $this->session->data['error'] = $error_message;

                $json['redirect'] = $this->url->link('checkout/checkout', '', true);

                $error['warning'] = $error_message;

                $json['error'] = $error ? $error : null;

                $status = 'success';

                $data   = $json;
                $output = json_encode(array(
                    'error'    => $error,
                    'status'   => $status,
                    'response' => $data,
                    'request'  => array(
                        'url'  => $this->request->server['REQUEST_URI'],
                        'get'  => $this->request->get,
                        'post' => $this->request->post,
                    ),
                ));

                $output = str_replace('&amp;', '&', $output);

                $this->response->addHeader('Content-Type: application/json');
                $this->response->setOutput($output);
            }
        }
    }

    public function viewGuestAfter($route, &$args, &$output)
    {
        $enable = $this->config->get('cargus_preferinte_postal_codes');

        if (!$enable) {
            return null;
        }

        //we add our custom code in twig
        $output .= '<script>';
        $output .= '$(document).ready(function(){ $.cargusGuestAddressForm(); });';
        $output .= '</script>';
    }

    public function modelAddCustomFieldsAfter($route, &$args, &$output)
    {
        $enable = $this->config->get('cargus_preferinte_postal_codes');

        if (!$enable) {
            return null;
        }

        $this->language->load('shipping/cargus');

        //we add our custom fields to the existing array

        $street = array(
            'custom_field_id' => 9001,
            'custom_field_value' => array(),
            'name' => $this->language->get('cargus_checkout_street'),
            'type' => 'text',
            'value' => '',
            'validation' => '',
            'location' => 'address',
            'required' => 1,
            'sort_order' => 2
        );

        $streetNr = array(
            'custom_field_id' => 9002,
            'custom_field_value' => array(),
            'name' => $this->language->get('cargus_checkout_street_number'),
            'type' => 'text',
            'value' => '',
            'validation' => '',
            'location' => 'address',
            'required' => 1,
            'sort_order' => 3
        );

        $output[] = $street;
        $output[] = $streetNr;
    }

    public function event($route, &$args, &$output)
    {
        $this->log->write('catalog ControllerExtensionModuleCargus event');
        $this->log->write('Route: ' . $route);
        $this->log->write('Args Info: ');
        $this->log->write($args);
        $this->log->write('Output: ');
        $this->log->write($output);
    }

    public function eventbefore($route, &$args)
    {
        $this->log->write('catalog ControllerExtensionModuleCargus eventbefore');
        $this->log->write('Route: ' . $route);
        $this->log->write('Args Info: ');
        $this->log->write($args);
    }

    public function localitati()
    {
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        // load cargus class
        $this->load->model('extension/shipping/cargus_cache');


        // extrag datele judetului intern pe baza id-ului
        $this->load->model('localisation/zone');
        $judet = $this->model_localisation_zone->getZone($this->request->get['judet']);

        // obtin lista de judete din api
        $judete = array();
        $dataJudete = $this->model_extension_shipping_cargus_cache->getCounties();

        foreach ($dataJudete as $val) {
            $judete[strtolower($val['Abbreviation'])] = $val['CountyId'];
        }

        // obtin lista de localitati pe baza abrevierii judetului
        $localitati = $this->model_extension_shipping_cargus_cache->getLocalities($judete[strtolower($judet['code'])]);

        // generez options pentru dropdown
        if (!empty($localitati)) {
            echo '<option value="" km="0">-</option>'."\n";
        }
        foreach ($localitati as $row) {
            $extraKm = (!$row['ExtraKm'] ? 0 : $row['ExtraKm']);
            $km = ($row['InNetwork'] ? 0 : $extraKm);

            echo '<option'.
                 (
                     trim(strtolower($this->request->get['val'])) == trim(strtolower($row['Name'])) ?
                         ' selected="selected"' :
                         ''
                 ).
                 ' data-zip="'. $row['PostalCode'] .'"'.
                 ' data-cid="'. $row['LocalityId'] .'"'.
                 ' km="'. $km .'">'.$row['Name'].
                 '</option>'."\n";
        }
    }

    public function streets()
    {
        $city = null;

        if (isset($this->request->post['city'])) {
            $city = $this->request->post['city'];
        }

        $this->load->model('extension/shipping/cargus_cache');

        $json = $this->model_extension_shipping_cargus_cache->getStreets($city);

        $this->response->addHeader('Content-Type: application/json');

        //data is already json
        $this->response->setOutput($json);
    }

    public function cities()
    {
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        $state = null;

        if (isset($this->request->post['state'])) {
            $state = $this->request->post['state'];
        }

        // load cargus class
        $this->load->model('extension/shipping/cargus_cache');


        // get county
        $this->load->model('localisation/zone');
        $judet = $this->model_localisation_zone->getZone($state);

        // get list of counties
        $judete = array();
        $dataJudete = $this->model_extension_shipping_cargus_cache->getCounties();

        foreach ($dataJudete as $val) {
            $judete[strtolower($val['Abbreviation'])] = $val['CountyId'];
        }

        // get list of localities using county code
        $json = $this->model_extension_shipping_cargus_cache->getLocalities($judete[strtolower($judet['code'])]);

        $this->response->addHeader('Content-Type: application/json');

        //data is already json
        $this->response->setOutput($json);
    }
}
