<?php
class ModelExtensionShippingCargus extends Model {
	function getQuote($address, $cod = 1) {
        unset($this->session->data['coupon_cargus']);

		$this->language->load('shipping/cargus');

		$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "zone_to_geo_zone WHERE geo_zone_id = '" . (int)$this->config->get('cargus_geo_zone_id') . "' AND country_id = '" . (int)$address['country_id'] . "' AND (zone_id = '" . (int)$address['zone_id'] . "' OR zone_id = '0')");

		if (!$this->config->get('cargus_geo_zone_id')) {
			$status = true;
		} elseif ($query->num_rows) {
			$status = true;
		} else {
			$status = false;
		}

		$method_data = array();

        try {
            if ($status && isset($address['iso_code_2']) && strtolower($address['iso_code_2']) == 'ro') {

                // verific daca in magazin este instalata moneda RON
                if (!$this->currency->has('ron') && !$this->currency->has('Ron') && !$this->currency->has('RON') && !$this->currency->has('lei') && !$this->currency->has('Lei') && !$this->currency->has('LEI')) {
                    return $method_data;
                }

                // stabilesc simbolul monedei default
                $simbol_moneda = '';
                if ($this->currency->has('ron')) {
                    $simbol_moneda = 'ron';
                }
                if ($this->currency->has('Ron')) {
                    $simbol_moneda = 'Ron';
                }
                if ($this->currency->has('RON')) {
                    $simbol_moneda = 'RON';
                }
                if ($this->currency->has('lei')) {
                    $simbol_moneda = 'lei';
                }
                if ($this->currency->has('Lei')) {
                    $simbol_moneda = 'Lei';
                }
                if ($this->currency->has('LEI')) {
                    $simbol_moneda = 'LEI';
                }

                $cart_total = $this->cart->getTotal();

                // transform totalul cosului in lei
                if (strtolower($this->config->get('config_currency')) != 'ron' && strtolower($this->config->get('config_currency')) != 'lei') {
                    $cart_total = $this->currency->convert($cart_total, $this->config->get('config_currency'), $simbol_moneda);
                }

                // stabilesc daca se aplica transportul gratuit
                $is_free = false;
                if ($this->config->get('cargus_preferinte_free') != '' && $this->config->get('cargus_preferinte_free') >= 0) {
                    if ($cart_total > $this->config->get('cargus_preferinte_free')) {
                        $is_free = true;
                    }
                }

                // daca este ales un cost fix pentru expeditie, nu mai calculeaza transportul si returneaza costul fix
                if ($this->config->get('cargus_preferinte_fixed') > 0 && $this->config->get('cargus_preferinte_fixed') != '') {
                    if ($is_free) {
                        $quote_price = 0;
                    } else {
                        $quote_price = $this->config->get('cargus_preferinte_fixed');
                    }

                    $quote_data['destinatie'] = array(
                        'code'         => 'cargus.destinatie',
                        'title'        => $this->language->get('text_description'),
                        'cost'         => $quote_price,
                        'tax_class_id' => $this->config->get('cargus_tax_class_id'),
                        'text'         => $this->currency->format($this->tax->calculate($quote_price, $this->config->get('cargus_tax_class_id'), $this->config->get('config_tax')), $this->config->get('config_currency'))
                    );

                    $method_data = array(
                        'code'       => 'cargus',
                        'title'      => $this->language->get('text_title'),
                        'quote'      => $quote_data,
                        'sort_order' => $this->config->get('cargus_sort_order'),
                        'error'      => false
                    );

                    return $method_data;
                }

                if (!isset($address['city']) || trim($address['city']) == '') {
                    return $method_data;
                }

                // obtin valoarea declarata a expeditiei
                if ($this->config->get('cargus_preferinte_insurance') == '1') {
                    $valoare_declarata = round($cart_total, 2);
                } else {
                    $valoare_declarata = 0;
                }

                // stabileste suma ramburs
                if ($cod == 0) {
                    $ramburs_cash = 0;
                    $ramburs_cont_colector = 0;
                } else {
                    if ($this->config->get('cargus_preferinte_repayment') == 'bank') {
                        $ramburs_cash = 0;
                        $ramburs_cont_colector = round($cart_total, 2);
                    } else {
                        $ramburs_cash = round($cart_total, 2);
                        $ramburs_cont_colector = 0;
                    }
                }

                // determin greutatea
                $total_weight = $this->cart->getWeight();
                if (strtolower($this->weight->getUnit($this->config->get('config_weight_class_id'))) != 'kg') {
                    if (strtolower($this->weight->getUnit(1)) == 'kg') {
                        $total_weight = $this->weight->convert($total_weight, $this->config->get('config_weight_class_id'), 1);
                    }
                }
                $total_weight = ceil($total_weight);
                if ($total_weight == 0) {
                    $total_weight = 1;
                }

                // instantiez clasa cargus
                require_once(DIR_APPLICATION.'model/extension/shipping/cargusclass.php');
                $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass();

                // setez url si key
                $this->model_shipping_cargusclass->SetKeys($this->config->get('cargus_api_url'), $this->config->get('cargus_api_key'));

                // UC login user
                $fields = array(
                    'UserName' => $this->config->get('cargus_username'),
                    'Password' => $this->config->get('cargus_password')
                );
                $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

                // UC punctul de ridicare default
                $location = array();
                $pickups = $this->model_shipping_cargusclass->CallMethod('PickupLocations', array(), 'GET', $token);
                if (is_null($pickups)) {
                    die('Nu exista niciun punct de ridicare asociat acestui cont!');
                }
                foreach ($pickups as $pick) {
                    if ($this->config->get('cargus_preferinte_pickup') == $pick['LocationId']) {
                        $location = $pick;
                    }
                }

                // UC shipping calculation
                $fields = array(
                    'FromLocalityId' => $location['LocalityId'],
                    'ToLocalityId' => 0,
                    'FromCountyName' => '',
                    'FromLocalityName' => '',
                    'ToCountyName' => $address['zone_code'],
                    'ToLocalityName' => $address['city'],
                    'Parcels' => $this->config->get('cargus_preferinte_type') != 'envelope' ? 1 : 0,
                    'Envelopes' => $this->config->get('cargus_preferinte_type') == 'envelope' ? 1 : 0,
                    'TotalWeight' => $total_weight,
                    'DeclaredValue' => $valoare_declarata,
                    'CashRepayment' => $ramburs_cash,
                    'BankRepayment' => $ramburs_cont_colector,
                    'OtherRepayment' => '',
                    'PaymentInstrumentId' => 0,
                    'PaymentInstrumentValue' => 0,
                    'OpenPackage' => $this->config->get('cargus_preferinte_openpackage') != 1 ? false : true,
                    'SaturdayDelivery' => $this->config->get('cargus_preferinte_saturday') != 1 ? false : true,
                    'MorningDelivery' => $this->config->get('cargus_preferinte_morning') != 1 ? false : true,
                    'ShipmentPayer' => $this->config->get('cargus_preferinte_payer') != 'recipient' ? 1 : 2
                );
                $fields['ServiceId'] = 0;
                if($this->config->get('cargus_preferinte_service_id')){
                   $fields['ServiceId'] = $this->config->get('cargus_preferinte_service_id');
                }

                if(in_array($this->config->get('cargus_preferinte_service_id'), array(34))) {
                    if ($total_weight <= 31) {
                        $fields['ServiceId'] = 34;
                    } elseif ($total_weight <= 50) {
                        $fields['ServiceId'] = 35;
                    } else {
                        $fields['ServiceId'] = 36;
                    }
                }


                $calculate = $this->model_shipping_cargusclass->CallMethod('ShippingCalculation', $fields, 'POST', $token);

                if (is_null($calculate)) {
                    echo '<pre>';
                    print_r($fields);
                    die();
                }

                $payer = $this->config->get('cargus_preferinte_payer');

                if ($is_free && $payer != 'recipient' && $calculate['ExtraKmCost'] > 0) {
                    $this->session->data['coupon_cargus'] = $this->tax->calculate(($calculate['Subtotal'] - $calculate['ExtraKmCost']), $this->config->get('cargus_tax_class_id'), $this->config->get('config_tax'));
                } else {
                    $this->session->data['coupon_cargus'] = 0;
                    unset($this->session->data['coupon_cargus']);
                }

                $quote_data = array();

                if ($is_free) {
                    if ($payer != 'recipient') {
                        if ($calculate['ExtraKmCost'] > 0) {
                            $cost = $calculate['Subtotal'];
                        } else {
                            $cost = 0;
                        }
                    } else {
                        $cost = $calculate['ExtraKmCost'];
                    }
                } else {
                    $cost = $calculate['Subtotal'];
                }

                // transforma pretul din lei in moneda default
                if (strtolower($this->config->get('config_currency')) != 'ron' && strtolower($this->config->get('config_currency')) != 'lei') {
                    $cost = $this->currency->convert($cost, $simbol_moneda, $this->config->get('config_currency'));
                }

                // adauga metoda pentru livrare la adresa destinatarului
                $quote_data['destinatie'] = array(
                    'code'         => 'cargus.destinatie',
                    'title'        => $this->language->get('text_description'),
                    'cost'         => $cost,
                    'tax_class_id' => $this->config->get('cargus_tax_class_id'),
                    'text'         => $this->currency->format($this->tax->calculate($cost, $this->config->get('cargus_tax_class_id'), $this->config->get('config_tax')), $this->config->get('config_currency'))
                );

                if ($this->config->get('cargus_preferinte_noextrakm') == 1 && $calculate['ExtraKmCost'] > 0) {
                    if ($is_free) {
                        if ($payer != 'recipient') {
                            $cost_redus = $calculate['Subtotal'] - $calculate['ExtraKmCost'];
                        } else {
                            $cost_redus = 0;
                        }
                    } else {
                        $cost_redus = $calculate['Subtotal'] - $calculate['ExtraKmCost'];
                    }

                    // transforma pretul din lei in moneda default
                    if (strtolower($this->config->get('config_currency') != 'ron') && strtolower($this->config->get('config_currency') != 'lei')) {
                        $cost_redus = $this->currency->convert($cost_redus, $simbol_moneda, $this->config->get('config_currency'));
                    }

                    // adauga metoda pentru ridicare de la sediul cargus
                    $quote_data['franciza'] = array(
                        'code'         => 'cargus.franciza',
                        'title'        => $this->language->get('text_description_2'),
                        'cost'         => $cost_redus,
                        'tax_class_id' => $this->config->get('cargus_tax_class_id'),
                        'text'         => $this->currency->format($this->tax->calculate($cost_redus, $this->config->get('cargus_tax_class_id'), $this->config->get('config_tax')), $this->config->get('config_currency'))
                    );
                }

                $method_data = array(
                    'code'       => 'cargus',
                    'title'      => $this->language->get('text_title'),
                    'quote'      => $quote_data,
                    'sort_order' => $this->config->get('cargus_sort_order'),
                    'error'      => false
                );
            }
        } catch (Exception $ex) {
            ob_clean();
            echo '<pre>';
            print_r($ex);
            die();
        }

		return $method_data;
	}
}