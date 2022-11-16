<?php

class ControllerExtensionModuleCargus extends Controller
{
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
//        . print_r($output, true));
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


        // extrag datele judetului intern pe baza id-ului
        $this->load->model('localisation/zone');
        $judet = $this->model_localisation_zone->getZone($state);

        // obtin lista de judete din api
        $judete = array();
        $dataJudete = $this->model_extension_shipping_cargus_cache->getCounties();

        foreach ($dataJudete as $val) {
            $judete[strtolower($val['Abbreviation'])] = $val['CountyId'];
        }

        // obtin lista de localitati pe baza abrevierii judetului
        $json = $this->model_extension_shipping_cargus_cache->getLocalities($judete[strtolower($judet['code'])]);

//        var_dump($json);

        $this->response->addHeader('Content-Type: application/json');

        //data is already json
        $this->response->setOutput($json);

        // generez options pentru dropdown
        /*if (!empty($localitati)) {
            echo '<option value="" km="0">-</option>'."\n";
        }
        foreach ($localitati as $row) {
            $extraKm = (!$row['ExtraKm'] ? 0 : $row['ExtraKm']);
            $km = ($row['InNetwork'] ? 0 : $extraKm);

            echo '<option'.

                 ' data-zip="'. $row['PostalCode'] .'"'.
                 ' data-cid="'. $row['LocalityId'] .'"'.
                 ' km="'. $km .'">'.$row['Name'].
                 '</option>'."\n";
        }*/
    }
}
