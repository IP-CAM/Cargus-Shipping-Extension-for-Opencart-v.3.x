<?php

class ControllerExtensionModuleCargus extends Controller
{
    public function viewGuestAfter($route, &$args, &$output)
    {
        $enable = $this->config->get('cargus_preferinte_postal_codes');

        if (!$enable) {
            return null;
        }

        error_log('viewGuestAfter='. $route);

        //we add our custom code in guest.twig
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

//        $this->log->write('Output final: ');
//        $this->log->write($output);
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
        // instantiez clasa cargus
        require_once(DIR_APPLICATION.'model/extension/shipping/cargusclass.php');
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass();

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys(
            $this->config->get('cargus_api_url'),
            $this->config->get('cargus_api_key')
        );

        // UC login user
        $fields = array(
            'UserName' => $this->config->get('cargus_username'),
            'Password' => $this->config->get('cargus_password')
        );
        $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

        // extrag datele judetului intern pe baza id-ului
        $this->load->model('localisation/zone');
        $judet = $this->model_localisation_zone->getZone($this->request->get['judet']);

        // obtin lista de judete din api
        $judete = array();
        $dataJudete = $this->model_shipping_cargusclass->CallMethod('Counties?countryId=1', array(), 'GET', $token);
        foreach ($dataJudete as $val) {
            $judete[strtolower($val['Abbreviation'])] = $val['CountyId'];
        }

        // obtin lista de localitati pe baza abrevierii judetului
        $localitati = $this->model_shipping_cargusclass->CallMethod(
            'Localities?countryId=1&countyId='.$judete[strtolower($judet['code'])],
            array(),
            'GET',
            $token
        );

        // generez options pentru dropdown
        if (count($localitati) > 1) {
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
                 ' cid="'. $row['LocalityId'] .'"'.
                 ' km="'. $km .'">'.$row['Name'].
                 '</option>'."\n";
        }
    }

    public function streets()
    {
        //
        error_log(__CLASS__ . ' ' . __FUNCTION__);

        $this->load->model('extension/shipping/cargus_cache');

        $this->model_extension_shipping_cargus_cache->test();
    }
}
