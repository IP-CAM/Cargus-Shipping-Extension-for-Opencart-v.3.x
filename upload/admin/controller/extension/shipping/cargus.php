<?php
require_once(DIR_CATALOG.'model/extension/shipping/cargusclass.php');

class ControllerExtensionShippingCargus extends Controller {
    private $codename = 'cargus_events';
    private $error = array();

    public function index() {

        $this->load->language('shipping/cargus');

        $this->document->setTitle($this->language->get('heading_title'));

        $this->load->model('setting/setting');

        if (isset($this->session->data['success'])) {
            $data['success'] = $this->session->data['success'];
            $this->session->data['success'] = null;
        }

        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $install = "CREATE TABLE IF NOT EXISTS `" . DB_PREFIX . "awb_cargus` (
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

            $this->alterTable();

            $deleteExtension = "DELETE FROM `" . DB_PREFIX . "extension` WHERE `type` = 'shipping' AND `code` = 'cargus' ";
            $this->db->query($deleteExtension);

            $addExtension = "INSERT INTO `" . DB_PREFIX . "extension` SET `type` = 'shipping', `code` = 'cargus' ";

            $this->db->query($addExtension);

            $this->model_setting_setting->editSetting('cargus', $this->request->post);

            $this->model_setting_setting->editSetting(
                'shipping_cargus_status', [
                    'shipping_cargus_status' => $this->request->post['shipping_cargus_status']
                ]
            );
            // instantiez clasa cargus
            $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

            // setez url si key
            $this->model_shipping_cargusclass->SetKeys($this->request->post['shipping_cargus_api_url'], $this->request->post['shipping_cargus_api_key']);

            // UC login user
            $fields = array(
                'UserName' => $this->request->post['shipping_cargus_username'],
                'Password' => $this->request->post['shipping_cargus_password']
            );
            $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

            if (is_array($token)) {
                $this->error['warning'] = $this->language->get('text_error').print_r($token, true);
            } else {
                $this->session->data['success'] = $this->language->get('text_success');
                $this->response->redirect($this->url->link('extension/shipping/cargus', 'user_token=' . $this->session->data['user_token'], true));
            }
        }

        if (isset($this->error['warning'])) {
            $data['error_warning'] = $this->error['warning'];
        } else {
            $data['error_warning'] = '';
        }

        $data['breadcrumbs'] = array();

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('text_home'),
            'href' => $this->url->link('common/home', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('text_extension'),
            'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('heading_title'),
            'href' => $this->url->link('extension/shipping/cargus', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['action'] = $this->url->link('extension/shipping/cargus', 'user_token=' . $this->session->data['user_token'], true);

        $data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'], true);

        if (isset($this->request->post['shipping_cargus_api_url'])) {
            $data['shipping_cargus_api_url'] = $this->request->post['shipping_cargus_api_url'];
        } else {
            $data['shipping_cargus_api_url'] = $this->config->get('shipping_cargus_api_url');
        }

        if (isset($this->request->post['shipping_cargus_api_key'])) {
            $data['shipping_cargus_api_key'] = $this->request->post['shipping_cargus_api_key'];
        } else {
            $data['shipping_cargus_api_key'] = $this->config->get('shipping_cargus_api_key');
        }

        if (isset($this->request->post['shipping_cargus_username'])) {
            $data['shipping_cargus_username'] = $this->request->post['shipping_cargus_username'];
        } else {
            $data['shipping_cargus_username'] = $this->config->get('shipping_cargus_username');
        }

        if (isset($this->request->post['shipping_cargus_password'])) {
            $data['shipping_cargus_password'] = $this->request->post['shipping_cargus_password'];
        } else {
            $data['shipping_cargus_password'] = $this->config->get('shipping_cargus_password');
        }

        if (isset($this->request->post['shipping_cargus_tax_class_id'])) {
            $data['shipping_cargus_tax_class_id'] = $this->request->post['shipping_cargus_tax_class_id'];
        } else {
            $data['shipping_cargus_tax_class_id'] = $this->config->get('shipping_cargus_tax_class_id');
        }

        $this->load->model('localisation/tax_class');

        $data['tax_classes'] = $this->model_localisation_tax_class->getTaxClasses();

        if (isset($this->request->post['shipping_cargus_geo_zone_id'])) {
            $data['shipping_cargus_geo_zone_id'] = $this->request->post['shipping_cargus_geo_zone_id'];
        } else {
            $data['shipping_cargus_geo_zone_id'] = $this->config->get('shipping_cargus_geo_zone_id');
        }

        $this->load->model('localisation/geo_zone');

        $data['geo_zones'] = $this->model_localisation_geo_zone->getGeoZones();

        if (isset($this->request->post['shipping_cargus_status'])) {
            $data['shipping_cargus_status'] = $this->request->post['shipping_cargus_status'];
        } else {
            $data['shipping_cargus_status'] = $this->config->get('shipping_cargus_status');
        }

        if (isset($this->request->post['shipping_cargus_sort_order'])) {
            $data['shipping_cargus_sort_order'] = $this->request->post['shipping_cargus_sort_order'];
        } else {
            $data['shipping_cargus_sort_order'] = $this->config->get('shipping_cargus_sort_order');
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

    public function addAwb()
    {
        $this->language->load('shipping/cargus');
        $this->load->language('extension/shipping/cargus');
        $this->load->model('sale/order');

        if (!isset($this->request->get['order_id']) || !($orderInfo = $this->model_sale_order->getOrder($this->request->get['order_id']))) {
            // Order id not sent or order not found.
            return new Action('error/not_found');
        }

        $this->load->model('extension/shipping/cargus');
        $awb = $this->model_extension_shipping_cargus->getAwbForOrderId($orderInfo['order_id']);

        if ($awb) {
            // Already generated.
            $this->session->data['success'] = $this->language->get('text_cargus_already_awb');

            $this->response->redirect($this->url->link('extension/cargus/comanda', $this->addToken(), true));
        }

        $result = $this->insertNewAwb($this->request->get['order_id']);

        if (!$result) {
            //error inserting new awb

            $this->session->data['error'] = $this->language->get('text_cargus_error_new_awb');
            $this->response->redirect($this->url->link('sale/order', $this->addToken(), true));
        }

        $awb = $this->model_extension_shipping_cargus->getAwbForOrderId($orderInfo['order_id']);

        //validate awb
        $result = $this->load->controller('extension/cargus/comanda/validateAwb', array($awb['id']));

        if (!$result) {
            //error validating awb
            $this->response->redirect($this->url->link('extension/cargus/comanda', $this->addToken(), true));
        }

        //all ok
        $this->session->data['success'] = '';
        $this->response->redirect($this->url->link('sale/order/info', $this->addToken(array('order_id' => $orderInfo['order_id'])), true));
    }

    public function add() {
        $result = $this->insertNewAwb($this->request->get['id']);

        if ($result) {
            echo 'ok';
        } else {
            echo 'err';
        }
    }

    private function insertNewAwb($order_id) {
        //error_reporting(E_ALL);
        //ini_set('display_errors', '0');
        //ini_set('log_errors', '1');

        if ($this->config->get('shipping_cargus_preferinte_pickup') != '') {
            $this->load->model('sale/order');
            $this->load->model('catalog/product');

            // obtin detaliile comenzii
            $order = $this->model_sale_order->getOrder($order_id);

            // calculeaza valoarea totala a cosului
            $total_data = $this->model_sale_order->getOrderTotals($order_id);
            $totals = array();
            foreach ($total_data as $row) {
                $totals[$row['code']] = $row['value'];
            }

//            require_once(DIR_SYSTEM . 'library/cart/customer.php');
//            $this->registry->set('customer', new Cart\Customer($this->registry));

//            require_once(DIR_SYSTEM . 'library/cart/tax.php');
//            $this->registry->set('tax', new Cart\Tax($this->registry));

            // calculez totalul transportului inclusiv taxele
            $shipping_total = $this->tax->calculate($totals['shipping'], $this->config->get('shipping_cargus_tax_class_id'));

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
            $order_prodcts = $this->model_sale_order->getOrderProducts($order_id);

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

                $p_options = $this->model_sale_order->getOrderOptions($order_id, $p['order_product_id']);

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
            if ($this->config->get('shipping_cargus_preferinte_insurance') == 1) {
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

            // check if we have pudo_location_id
            $pudo_location_id = (!empty($order['shipping_custom_field'])) ? $order['shipping_custom_field'] : null;

            if (is_null($pudo_location_id) || !isset($pudo_location_id['pudo_location_id'])) {
                $pudo_location_id = (!empty($order['custom_field'])) ? $order['custom_field'] : null;
            }
            if ($pudo_location_id && isset($pudo_location_id['pudo_location_id'])) {
                $pudo_location_id = $pudo_location_id['pudo_location_id'];
            } else {
                //pudo_location_id could have other data from 'shipping_custom_field', we need to empty it
                $pudo_location_id = null;
            }

            // adaug awb-ul in baza de date
            $sql = "INSERT INTO awb_cargus SET
                                order_id = '".addslashes($order_id)."',
                                pickup_id = '".addslashes($this->config->get('shipping_cargus_preferinte_pickup'))."',
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
                                parcels = '".($this->config->get('shipping_cargus_preferinte_type') != 'envelope' ? 1 : 0)."',
                                envelopes = '".($this->config->get('shipping_cargus_preferinte_type') == 'envelope' ? 1 : 0)."',
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
                                shipping_code = '".addslashes($order['shipping_code'])."',
                                pudo_location_id = '".addslashes($pudo_location_id)."'
                            ";

            if ($this->db->query($sql)) {
//                echo 'ok';
                return true;
            } else {
//                echo 'err';
                return false;
            }
        } else {
            error_log('shipping_cargus_preferinte_pickup is empty? value='.$this->config->get('shipping_cargus_preferinte_pickup'));

            $this->log->write('shipping_cargus_preferinte_pickup is empty? value='.$this->config->get('shipping_cargus_preferinte_pickup'));

//            echo 'err';
            return false;
        }
    }

    public function install() {
        $this->load->model('user/user_group');

        $this->log->write('Shipping cargus install');

        $user_group_id = $this->user->getGroupId();


        $this->model_user_user_group->addPermission($user_group_id, 'access', 'extension/cargus');
        $this->model_user_user_group->addPermission($user_group_id, 'modify', 'extension/cargus');

        $this->model_user_user_group->addPermission($user_group_id, 'access', 'extension/cargus/preferinte');
        $this->model_user_user_group->addPermission($user_group_id, 'modify', 'extension/cargus/preferinte');

        $this->model_user_user_group->addPermission($user_group_id, 'access', 'extension/cargus/ship_and_go');
        $this->model_user_user_group->addPermission($user_group_id, 'modify', 'extension/cargus/ship_and_go');

        $this->model_user_user_group->addPermission($user_group_id, 'access', 'extension/shipping/cargus');
        $this->model_user_user_group->addPermission($user_group_id, 'modify', 'extension/shipping/cargus');

        $this->model_user_user_group->addPermission($user_group_id, 'access', 'extension/cargus/comanda');
        $this->model_user_user_group->addPermission($user_group_id, 'modify', 'extension/cargus/comanda');

        $this->model_user_user_group->addPermission($user_group_id, 'access', 'extension/cargus/edit');
        $this->model_user_user_group->addPermission($user_group_id, 'modify', 'extension/cargus/edit');


        $theme = $this->config->get('config_theme');
        $this->load->model('setting/event');

        if ($theme != 'journal3') {
            // List of events
            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/model/account/custom_field/getCustomFields/after',
                'extension/module/cargus/modelAddCustomFieldsAfter'
            );

            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/view/checkout/guest/after',
                'extension/module/cargus/viewGuestAfter'
            );

            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/view/checkout/guest_shipping/after',
                'extension/module/cargus/viewGuestAfter'
            );

            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/view/account/address_form/after',
                'extension/module/cargus/viewGuestAfter'
            );

            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/view/checkout/payment_address/after',
                'extension/module/cargus/viewGuestAfter'
            );

            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/controller/checkout/shipping_method/save/after',
                'extension/module/cargus/carrierSaveAfter'
            );
        } else {
            //catalog/view/journal3/checkout/checkout
            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/view/journal3/checkout/checkout/after',
                'extension/module/cargus/journal3CheckoutAfter'
            );

            //journal3 checkout
            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/controller/journal3/checkout/save/after',
                'extension/module/cargus/carrierSaveAfter'
            );

            //journal3 checkout
            $this->model_setting_event->addEvent(
                $this->codename,
                'catalog/controller/journal3/checkout/save/before',
                'extension/module/cargus/journal3CheckoutSaveBefore'
            );
        }

        //add menu items
        $this->model_setting_event->addEvent(
            $this->codename,
            'admin/view/common/column_left/before',
            'extension/module/cargus/columnLeftBefore'
        );

        //admin/view/template/sale/order_list.twig
        $this->model_setting_event->addEvent(
            $this->codename,
            'admin/view/sale/order_list/after',
            'extension/module/cargus/orderListAfter'
        );

        //admin/view/template/sale/order_info
        $this->model_setting_event->addEvent(
            $this->codename,
            'admin/view/sale/order_info/before',
            'extension/module/cargus/orderInfoBefore'
        );
        $this->model_setting_event->addEvent(
            $this->codename,
            'admin/view/sale/order_info/after',
            'extension/module/cargus/orderInfoAfter'
        );

        //admin/view/template/common/header
        $this->model_setting_event->addEvent(
            $this->codename,
            'admin/view/common/header/after',
            'extension/module/cargus/commonHeaderAfter'
        );

        //catalog/controller/checkout/shipping_method
        $this->model_setting_event->addEvent(
            $this->codename,
            'catalog/controller/checkout/shipping_method/before',
            'extension/module/cargus/checkoutShippingMethodBefore'
        );

        //catalog/view/checkout/payment_method
        $this->model_setting_event->addEvent(
            $this->codename,
            'catalog/view/checkout/payment_method/after',
            'extension/module/cargus/checkoutPaymentMethodAfter'
        );

        //catalog/view/common/header
        $this->model_setting_event->addEvent(
            $this->codename,
            'catalog/view/common/header/after',
            'extension/module/cargus/commonHeaderAfter'
        );

        //catalog/view/checkout/shipping_method
        $this->model_setting_event->addEvent(
            $this->codename,
            'catalog/view/checkout/shipping_method/after',
            'extension/module/cargus/checkoutShippingMethodAfter'
        );

        //catalog/view/account/order_info
        $this->model_setting_event->addEvent(
            $this->codename,
            'catalog/view/account/order_info/before',
            'extension/module/cargus/orderInfoBefore'
        );
        $this->model_setting_event->addEvent(
            $this->codename,
            'catalog/view/account/order_info/after',
            'extension/module/cargus/orderInfoAfter'
        );


        $this->alterTable();
    }

    public function uninstall() {
        $this->load->model('setting/event');
        $this->model_setting_event->deleteEventByCode($this->codename);
        $this->log->write('Shipping cargus uninstall');
    }

    /**
     * Get data for order info template.
     *
     * @param $orderInfo
     *
     * @return array|null
     */
    public function info($orderInfo)
    {
        if (!$orderInfo) {
            return null;
        }

        $this->language->load('shipping/cargus');
        $this->load->model('extension/shipping/cargus');

        $awb = $this->model_extension_shipping_cargus->getAwbForOrderId($orderInfo['order_id']);

        $data['awb_number'] = 0;

        if (isset($awb['barcode']) && !empty($awb['barcode'])) {
            $data['awb_number'] = $awb['barcode'];
        }



        $data = array(
            'buttonAddAwb' => $this->language->get('text_cargus_button_add_awb'),
//            'buttonDeleteAwb' => $this->language->get('text_button_delete_awb'),
            'buttonShowAwb' => $this->language->get('text_cargus_print_awb'),
            'buttonAddAwbLink' => $this->url->link(
                'extension/shipping/cargus/addAwb',
                $this->addToken(array('order_id' => $orderInfo['order_id'])),
                true
            ),
            'buttonShowAwbPdf' => $this->url->link(
                'extension/cargus/comanda/print_awbs',
                $this->addToken(array('bar_codes' => $data['awb_number'], 'format' => 0)),
                true
            ),

            'buttonShowAwbHistory' => $this->url->link('extension/cargus/comanda', $this->addToken(), true),
//            'buttonDeleteAwbLink' => $this->url->link('extension/shipping/sameday/deleteAwb', $this->addToken(array('order_id' => $orderInfo['order_id'])), true)
        );

        $awb = $this->model_extension_shipping_cargus->getAwbForOrderId($orderInfo['order_id']);

        if (isset($awb['barcode']) && !empty($awb['barcode'])) {
            $data['awb_number'] = $awb['barcode'];
        }

        if (isset($awb['ReturnCode']) && !empty($awb['ReturnCode'])) {
            $data['ReturnCode'] = $awb['ReturnCode'];
        }

        if (isset($awb['ReturnAwb']) && !empty($awb['ReturnAwb'])) {
            $data['ReturnAwb'] = $awb['ReturnAwb'];
        }

        return $data;
    }

    /**
     * @param array $parts
     *
     * @return array
     */
    private function addToken(array $parts = array())
    {
        if (isset($this->session->data['token'])) {
            return array_merge($parts, array('token' => $this->session->data['token']));
        }

        if (isset($this->session->data['user_token'])) {
            return array_merge($parts, array('user_token' => $this->session->data['user_token']));
        }

        return $parts;
    }

    private function alterTable()
    {
        try {
            $sql = "ALTER TABLE awb_cargus ADD COLUMN ReturnCode VARCHAR(50) AFTER shipping_code";
            $this->db->query($sql);

            $sql = "ALTER TABLE awb_cargus ADD COLUMN ReturnAwb VARCHAR(50) AFTER shipping_code";
            $this->db->query($sql);
        } catch (Exception $e) {
            // whe need to avoid DB error
//            $this->log->write('Error alter table: ' . $e->getMessage());
        }
    }
}
