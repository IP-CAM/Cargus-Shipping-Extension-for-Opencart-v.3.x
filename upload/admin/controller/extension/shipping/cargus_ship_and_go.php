<?php
class ControllerExtensionShippingCargusShipAndGo extends Controller {
	private $error = array();

	public function index() {

        $this->language->load('shipping/cargus');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');

        if (isset($this->session->data['success'])) {
            $data['success'] = $this->session->data['success'];
            $this->session->data['success'] = null;
        }

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $install = "CREATE TABLE IF NOT EXISTS `awb_cargus` (
                            `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                            `order_id` int(11) NOT NULL,
                            `pickup_id` int(11) NOT NULL,
                            `name` varchar(64) NOT NULL,
                            `locality_name` varchar(128) NOT NULL,
                            `county_name` varchar(128) NOT NULL,
                            `street_name` varchar(128) NOT NULL,
                            `number` int(11) NOT NULL,
                            `address` varchar(256) NOT NULL,
                            `postcode` varchar(64) NOT NULL,
                            `contact` varchar(64) NOT NULL,
                            `phone` varchar(32) NOT NULL,
                            `email` varchar(96) NOT NULL,
                            `parcels` int(11) NOT NULL,
                            `envelopes` int(11) NOT NULL,
                            `weight` int(11) NOT NULL,
                            `value` double NOT NULL,
                            `cash_repayment` double NOT NULL,
                            `bank_repayment` double NOT NULL,
                            `other_repayment` varchar(256) NOT NULL,
                            `payer` int(11) NOT NULL,
                            `saturday_delivery` tinyint(1) NOT NULL,
	                        `morning_delivery` tinyint(1) NOT NULL,
	                        `openpackage` tinyint(1) NOT NULL,
                            `observations` varchar(256) NOT NULL,
                            `contents` varchar(256) NOT NULL,
                            `barcode` varchar(50) NOT NULL,
                            `shipping_code` varchar(256) NOT NULL,
                            `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        PRIMARY KEY (`id`)
                        ) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";
            $this->db->query($install);

            $deleteExtension = "DELETE FROM `" . DB_PREFIX . "extension` WHERE `type` = 'shipping' AND `code` = 'cargus_ship_and_go' ";
            $this->db->query($deleteExtension);

            $addExtension = "INSERT INTO `" . DB_PREFIX . "extension` SET `type` = 'shipping', `code` = 'cargus_ship_and_go' ";
            $this->db->query($addExtension);

			$this->model_setting_setting->editSetting('cargus', $this->request->post);


            // instantiez clasa cargus
            require(DIR_CATALOG.'model/extension/shipping/cargusclass.php');
            $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass();

            // setez url si key
            $this->model_shipping_cargusclass->SetKeys($this->request->post['cargus_api_url'], $this->request->post['cargus_api_key']);

            // UC login user
            $fields = array(
                'UserName' => $this->request->post['cargus_username'],
                'Password' => $this->request->post['cargus_password']
            );
            $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

            if (is_array($token)) {
                $this->error['warning'] = $this->language->get('text_error').$token['data'];
            } else {
                $this->session->data['success'] = $this->language->get('text_success');
                $this->response->redirect($this->url->link('extension/shipping/cargus', 'user_token=' . $this->session->data['user_token'], 'SSL'));
            }
		}

		$data['heading_title'] = $this->language->get('heading_title');
        $data['text_edit'] = $this->language->get('text_edit');
		$data['text_enabled'] = $this->language->get('text_enabled');
		$data['text_disabled'] = $this->language->get('text_disabled');
		$data['text_all_zones'] = $this->language->get('text_all_zones');
		$data['text_none'] = $this->language->get('text_none');
        $data['entry_api_url'] = $this->language->get('entry_api_url');
        $data['entry_api_key'] = $this->language->get('entry_api_key');
        $data['entry_username'] = $this->language->get('entry_username');
        $data['entry_password'] = $this->language->get('entry_password');
        $data['entry_tax_class'] = $this->language->get('entry_tax_class');
		$data['entry_geo_zone'] = $this->language->get('entry_geo_zone');
		$data['entry_status'] = $this->language->get('entry_status');
		$data['entry_sort_order'] = $this->language->get('entry_sort_order');
		$data['button_save'] = $this->language->get('button_save');
		$data['button_cancel'] = $this->language->get('button_cancel');

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}

		$data['breadcrumbs'] = array();
		$data['breadcrumbs'][] = array(
			'text'      => $this->language->get('text_home'),
			'href'      => $this->url->link('common/home', 'user_token=' . $this->session->data['user_token'], 'SSL')
		);
		$data['breadcrumbs'][] = array(
			'text'      => $this->language->get('text_shipping'),
			'href'      => $this->url->link('extension/shipping', 'user_token=' . $this->session->data['user_token'], 'SSL')
		);
		$data['breadcrumbs'][] = array(
			'text'      => $this->language->get('heading_title'),
			'href'      => $this->url->link('extension/shipping/cargus', 'user_token=' . $this->session->data['user_token'], 'SSL')
		);

		$data['action'] = $this->url->link('extension/shipping/cargus', 'user_token=' . $this->session->data['user_token'], 'SSL');
		$data['cancel'] = $this->url->link('extension/shipping', 'user_token=' . $this->session->data['user_token'], 'SSL');

        if (isset($this->request->post['cargus_api_url'])) {
			$data['cargus_api_url'] = $this->request->post['cargus_api_url'];
		} else {
			$data['cargus_api_url'] = $this->config->get('cargus_api_url');
		}

        if (isset($this->request->post['cargus_api_key'])) {
			$data['cargus_api_key'] = $this->request->post['cargus_api_key'];
		} else {
			$data['cargus_api_key'] = $this->config->get('cargus_api_key');
		}

        if (isset($this->request->post['cargus_username'])) {
			$data['cargus_username'] = $this->request->post['cargus_username'];
		} else {
			$data['cargus_username'] = $this->config->get('cargus_username');
		}

        if (isset($this->request->post['cargus_password'])) {
			$data['cargus_password'] = $this->request->post['cargus_password'];
		} else {
			$data['cargus_password'] = $this->config->get('cargus_password');
		}

        if (isset($this->request->post['cargus_tax_class_id'])) {
			$data['cargus_tax_class_id'] = $this->request->post['cargus_tax_class_id'];
		} else {
			$data['cargus_tax_class_id'] = $this->config->get('cargus_tax_class_id');
		}

        $this->load->model('localisation/tax_class');
		$data['tax_classes'] = $this->model_localisation_tax_class->getTaxClasses();

		if (isset($this->request->post['cargus_geo_zone_id'])) {
			$data['cargus_geo_zone_id'] = $this->request->post['cargus_geo_zone_id'];
		} else {
			$data['cargus_geo_zone_id'] = $this->config->get('cargus_geo_zone_id');
		}

		$this->load->model('localisation/geo_zone');
		$data['geo_zones'] = $this->model_localisation_geo_zone->getGeoZones();

		if (isset($this->request->post['cargus_status'])) {
			$data['cargus_status'] = $this->request->post['cargus_status'];
		} else {
			$data['cargus_status'] = $this->config->get('cargus_status');
		}

		if (isset($this->request->post['cargus_sort_order'])) {
			$data['cargus_sort_order'] = $this->request->post['cargus_sort_order'];
		} else {
			$data['cargus_sort_order'] = $this->config->get('cargus_sort_order');
		}

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/shipping/cargus', $data));
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/shipping/cargus')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}

    public function add() {
        error_reporting(E_ALL);
        ini_set('display_errors', '1');
        if ($this->config->get('cargus_preferinte_pickup') != '') {
            $this->load->model('sale/order');
            $this->load->model('catalog/product');

            // obtin detaliile comenzii
            $order = $this->model_sale_order->getOrder($this->request->get['id']);

            // calculeaza valoarea totala a cosului
            $total_data = $this->model_sale_order->getOrderTotals($this->request->get['id']);
            $totals = array();
            foreach ($total_data as $row) {
                $totals[$row['code']] = $row['value'];
            }

            require_once(DIR_SYSTEM . 'library/cart/customer.php');
            $this->registry->set('customer', new Cart\Customer($this->registry));

            require_once(DIR_SYSTEM . 'library/cart/tax.php');
            $this->registry->set('tax', new Cart\Tax($this->registry));

            // calculez totalul transportului inclusiv taxele
            $shipping_total = $this->tax->calculate($totals['shipping'], $this->config->get('cargus_tax_class_id'));

            // transform totalul transportului in lei
            if ($this->config->get('config_currency') != 'RON') {
                $shipping_total = $this->currency->convert($shipping_total, $this->config->get('config_currency'), 'RON');
            }

            // calculez totalul comenzii inclusiv taxele
            $cart_total = $totals['total'];

            // transform totalul comenzii in lei
            if ($this->config->get('config_currency') != 'RON') {
                $cart_total = $this->currency->convert($cart_total, $this->config->get('config_currency'), 'RON');
            }

            // calculez greutatea totala a comenzii in kilograme
            $order_prodcts = $this->model_sale_order->getOrderProducts($this->request->get['id']);
            $products = array();
            $weight = 0;
            $contents_array = array();
            foreach ($order_prodcts as $p) {
                $product = $this->model_catalog_product->getProduct($p['product_id']);
                if ($product['weight_class_id'] == 1) { // kilograms
                    $weight += $product['weight'];
                } elseif ($product['weight_class_id'] == 2) { // grams
                    $weight += ($product['weight'] / 1000);
                } elseif ($product['weight_class_id'] == 3) { // pounds
                    $weight += ($product['weight'] * 0.453592);
                } elseif ($product['weight_class_id'] == 4) { // ounces
                    $weight += ($product['weight'] * 0.0283495);
                } else {
                    $weight += 1;
                }
                $products[] = $product;

                $options_as_string = '';
                $options_as_array = array();
                $p_options = $this->model_sale_order->getOrderOptions($this->request->get['id'], $p['order_product_id']);
                if (is_array($p_options) && count($p_options) > 0) {
                    foreach ($p_options as $po) {
                        $options_as_array[] = trim($po['name']).': '.trim($po['value']);
                    }
                }
                if (count($options_as_array) > 0) {
                    $options_as_string = ' ('.implode(';', $options_as_array).')';
                }
                $contents_array[] = $p['quantity'].' x ' . trim($p['name']) . $options_as_string;
            }
            if ($weight == 0) {
                $weight = 1;
            } else {
                $weight = ceil($weight);
            }

            // determin valoarea declarata
            if ($this->config->get('cargus_preferinte_insurance') == 1) {
                $value = round($cart_total - $shipping_total, 2);
            } else {
                $value = 0;
            }

            // determin livrarea sambata
            if ($this->config->get('cargus_preferinte_saturday') == 1) {
                $saturday = 1;
            } else {
                $saturday = 0;
            }

            // determin livrarea dimineata
            if ($this->config->get('cargus_preferinte_morning') == 1) {
                $morning = 1;
            } else {
                $morning = 0;
            }

            // determin deschidere colet
            if ($this->config->get('cargus_preferinte_openpackage') == 1) {
                $openpackage = 1;
            } else {
                $openpackage = 0;
            }

            // afla daca aceasta comanda a fost platita si daca nu determin rambursul si platitorul expeditiei
            if ($order['payment_code'] == 'cod') {
                if ($this->config->get('cargus_preferinte_payer') == 'recipient') {
                    $payer = 2;
                } else {
                    $payer = 1;
                }
                if ($this->config->get('cargus_preferinte_repayment') == 'bank') {
                    $cash_repayment = 0;
                    if ($payer == 1) {
                        $bank_repayment = round($cart_total, 2);
                    } else {
                        $bank_repayment = round($cart_total - $shipping_total, 2);
                    }
                } else {
                    if ($payer == 1) {
                        $cash_repayment = round($cart_total, 2);
                    } else {
                        $cash_repayment = round($cart_total - $shipping_total, 2);
                    }
                    $bank_repayment = 0;
                }
            } else {
                $bank_repayment = 0;
                $cash_repayment = 0;
                $payer = 1;
            }

            // adaug awb-ul in baza de date
            $sql = "INSERT INTO awb_cargus SET
                                order_id = '".addslashes($this->request->get['id'])."',
                                pickup_id = '".addslashes($this->config->get('cargus_preferinte_pickup'))."',
                                name = '".addslashes(htmlentities($order['shipping_company'] ? $order['shipping_company'] : implode(' ', array($order['shipping_firstname'], $order['shipping_lastname']))))."',
                                locality_name = '".addslashes(htmlentities($order['shipping_city']))."',
                                county_name = '".addslashes(htmlentities($order['shipping_zone_code']))."',
                                street_name = '',
                                number = '',
                                address = '".addslashes(htmlentities($order['shipping_address_1'].($order['shipping_address_2'] ? "\n".$order['shipping_address_2'] : '')))."',
                                postcode = '".addslashes($order['shipping_postcode'])."',
                                contact = '".addslashes(htmlentities(implode(' ', array($order['shipping_firstname'], $order['shipping_lastname']))))."',
                                phone = '".addslashes($order['telephone'])."',
                                email = '".addslashes($order['email'])."',
                                parcels = '".($this->config->get('cargus_preferinte_type') != 'envelope' ? 1 : 0)."',
                                envelopes = '".($this->config->get('cargus_preferinte_type') == 'envelope' ? 1 : 0)."',
                                weight = '".addslashes($weight)."',
                                value = '".addslashes($value)."',
                                cash_repayment = '".addslashes($cash_repayment)."',
                                bank_repayment = '".addslashes($bank_repayment)."',
                                other_repayment = '',
                                payer = '".addslashes($payer)."',
                                saturday_delivery = '".addslashes($saturday)."',
                                morning_delivery = '".addslashes($morning)."',
                                openpackage = '".addslashes($openpackage)."',
                                observations = '',
                                contents = '".addslashes(htmlentities(implode('; ', $contents_array)))."',
                                barcode = '0',
                                shipping_code = '".addslashes($order['shipping_code'])."'
                            ";

            if ($this->db->query($sql)) {
                echo 'ok';
            } else {
                echo 'err';
            }
        } else {
            echo 'err';
        }
    }

    public function install() {
        $this->load->model('user/user_group');

        $this->log->write('admin ship&go cargus install');

        $this->model_user_user_group->addPermission($this->user->getId(), 'access', 'extension/shipping/cargus');
        $this->model_user_user_group->addPermission($this->user->getId(), 'modify', 'extension/shipping/cargus');
    }
}