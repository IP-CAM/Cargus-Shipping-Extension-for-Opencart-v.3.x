<?php
require_once(DIR_CATALOG . 'model/extension/shipping/cargusclass.php');

class ControllerExtensionShippingCargusPreferinte extends Controller {
    private $error = array();

    public function index() {
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        $this->load->language('extension/shipping/cargus/cargus_preferinte');

        $this->document->setTitle($this->language->get('heading_title'));

        $this->load->model('setting/setting');

        $data['success'] = '';
        $data['error'] = '';
        $data['error_warning'] = '';
        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $this->model_setting_setting->editSetting('shipping_cargus_preferinte', $this->request->post);

            $data['success'] = $this->language->get('text_success');
        }

        //load cargus class from catalog
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys($this->config->get('shipping_cargus_api_url'), $this->config->get('shipping_cargus_api_key'));

        // UC login user
        $fields = array(
            'UserName' => $this->config->get('shipping_cargus_username'),
            'Password' => $this->config->get('shipping_cargus_password')
        );
        $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

        if (is_array($token)) {
            $data['valid'] = false;
            $data['error'] = $this->language->get('text_error').$token['data'];
        } else {
            $data['valid'] = true;

            // obtine lista planurilor tarifare
            $data['prices'] = $this->model_shipping_cargusclass->CallMethod('PriceTables', array(), 'GET', $token);
            if (is_null($data['prices'])) {
                $data['valid'] = false;
                $data['error'] = $this->language->get('text_error').'Nu exista niciun plan tarifar asociat acestui cont!';
            }

            // obtine lista punctelor de ridicare
            $data['pickups'] = $this->model_shipping_cargusclass->CallMethod('PickupLocations', array(), 'GET', $token);
            if (is_null($data['pickups'])) {
                $data['valid'] = false;
                $data['error'] = $this->language->get('text_error').'Nu exista niciun punct de ridicare asociat acestui cont!';
            }

//            $data['entry_price'] = $this->language->get('entry_price');
//            $data['entry_pickup'] = $this->language->get('entry_pickup');
//            $data['entry_insurance'] = $this->language->get('entry_insurance');
//            $data['entry_saturday'] = $this->language->get('entry_saturday');
//            $data['entry_morning'] = $this->language->get('entry_morning');
//            $data['entry_openpackage'] = $this->language->get('entry_openpackage');
//            $data['entry_repayment'] = $this->language->get('entry_repayment');
//            $data['entry_payer'] = $this->language->get('entry_payer');
//            $data['entry_type'] = $this->language->get('entry_type');
//            $data['entry_noextrakm'] = $this->language->get('entry_noextrakm');
//            $data['entry_noextrakm_details'] = $this->language->get('entry_noextrakm_details');
//            $data['entry_free'] = $this->language->get('entry_free');
//            $data['entry_free_details'] = $this->language->get('entry_free_details');
//            $data['entry_fixed'] = $this->language->get('entry_fixed');
//            $data['entry_fixed_details'] = $this->language->get('entry_fixed_details');
//            $data['entry_service_id'] = $this->language->get('entry_service_id');
//            $data['entry_service_id_details'] = $this->language->get('entry_service_id_details');

            $data['shipping_cargus_preferinte_awb_retur_options'] = array(
                '0' => $this->language->get('entry_awb_retur_options_0'),
                '1' => $this->language->get('entry_awb_retur_options_1'),
                '2' => $this->language->get('entry_awb_retur_options_2')
            );

            $data['shipping_cargus_preferinte_print_awb_retur_options'] = array(
                '0' => $this->language->get('entry_print_awb_retur_options_0'),
                '2' => $this->language->get('entry_print_awb_retur_options_2')
            );

            $data['shipping_cargus_preferinte_service_id_options'] = array(''=>'');
            foreach (array(1,34,39) as $elm) {
                $data['shipping_cargus_preferinte_service_id_options'][$elm] = $this->language->get('entry_service_id_'.$elm);
            }

            $data['cancel'] = $this->url->link('extension/shipping/cargus/cargus_preferinte', 'user_token=' . $this->session->data['user_token'], true);

            if (isset($this->error['warning'])) {
                $data['error_warning'] = $this->error['warning'];
            } else {
                $data['error_warning'] = '';
            }

            $data['action'] = $this->url->link('extension/shipping/cargus/preferinte', 'user_token=' . $this->session->data['user_token'], true);

            if (isset($this->request->post['shipping_cargus_preferinte_price'])) {
               $data['shipping_cargus_preferinte_price'] = $this->request->post['shipping_cargus_preferinte_price'];
            } else {
               $data['shipping_cargus_preferinte_price'] = $this->config->get('shipping_cargus_preferinte_price');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_pickup'])) {
                $data['shipping_cargus_preferinte_pickup'] = $this->request->post['shipping_cargus_preferinte_pickup'];
            } else {
                $data['shipping_cargus_preferinte_pickup'] = $this->config->get('shipping_cargus_preferinte_pickup');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_pickup_locality'])) {
                $data['shipping_cargus_preferinte_pickup_locality'] = $this->request->post['shipping_cargus_preferinte_pickup_locality'];
            } else {
                $data['shipping_cargus_preferinte_pickup_locality'] = $this->config->get('shipping_cargus_preferinte_pickup_locality');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_insurance'])) {
                $data['shipping_cargus_preferinte_insurance'] = $this->request->post['shipping_cargus_preferinte_insurance'];
            } else {
                $data['shipping_cargus_preferinte_insurance'] = $this->config->get('shipping_cargus_preferinte_insurance');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_saturday'])) {
                $data['shipping_cargus_preferinte_saturday'] = $this->request->post['shipping_cargus_preferinte_saturday'];
            } else {
                $data['shipping_cargus_preferinte_saturday'] = $this->config->get('shipping_cargus_preferinte_saturday');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_morning'])) {
                $data['shipping_cargus_preferinte_morning'] = $this->request->post['shipping_cargus_preferinte_morning'];
            } else {
                $data['shipping_cargus_preferinte_morning'] = $this->config->get('shipping_cargus_preferinte_morning');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_openpackage'])) {
                $data['shipping_cargus_preferinte_openpackage'] = $this->request->post['shipping_cargus_preferinte_openpackage'];
            } else {
                $data['shipping_cargus_preferinte_openpackage'] = $this->config->get('shipping_cargus_preferinte_openpackage');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_repayment'])) {
                $data['shipping_cargus_preferinte_repayment'] = $this->request->post['shipping_cargus_preferinte_repayment'];
            } else {
                $data['shipping_cargus_preferinte_repayment'] = $this->config->get('shipping_cargus_preferinte_repayment');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_payer'])) {
                $data['shipping_cargus_preferinte_payer'] = $this->request->post['shipping_cargus_preferinte_payer'];
            } else {
                $data['shipping_cargus_preferinte_payer'] = $this->config->get('shipping_cargus_preferinte_payer');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_type'])) {
                $data['shipping_cargus_preferinte_type'] = $this->request->post['shipping_cargus_preferinte_type'];
            } else {
                $data['shipping_cargus_preferinte_type'] = $this->config->get('shipping_cargus_preferinte_type');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_free'])) {
                $data['shipping_cargus_preferinte_free'] = $this->request->post['shipping_cargus_preferinte_free'];
            } else {
                $data['shipping_cargus_preferinte_free'] = $this->config->get('shipping_cargus_preferinte_free');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_fixed'])) {
                $data['shipping_cargus_preferinte_fixed'] = $this->request->post['shipping_cargus_preferinte_fixed'];
            } else {
                $data['shipping_cargus_preferinte_fixed'] = $this->config->get('shipping_cargus_preferinte_fixed');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_noextrakm'])) {
                $data['shipping_cargus_preferinte_noextrakm'] = $this->request->post['shipping_cargus_preferinte_noextrakm'];
            } else {
                $data['shipping_cargus_preferinte_noextrakm'] = $this->config->get('shipping_cargus_preferinte_noextrakm');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_service_id'])) {
                $data['shipping_cargus_preferinte_service_id'] = $this->request->post['shipping_cargus_preferinte_service_id'];
            } else {
                $data['shipping_cargus_preferinte_service_id'] = $this->config->get('shipping_cargus_preferinte_service_id');
            }

            $theme = $this->config->get('config_theme');

            if ($theme != 'journal3') {
                $data['cargus_preferinte_postal_codes'] = $this->config->get( 'shipping_cargus_preferinte_postal_codes' );

                if ( $this->request->server['REQUEST_METHOD'] == 'POST' ) {
                    $data['shipping_cargus_preferinte_postal_codes'] = 0;
                    if ( isset( $this->request->post['shipping_cargus_preferinte_postal_codes'] ) ) {
                        $data['shipping_cargus_preferinte_postal_codes'] = $this->request->post['shipping_cargus_preferinte_postal_codes'];
                    }
                }
            }

            if (isset($this->request->post['shipping_cargus_preferinte_awb_retur_validitate'])) {
                $data['shipping_cargus_preferinte_awb_retur_validitate'] = $this->request->post['shipping_cargus_preferinte_awb_retur_validitate'];
            } else {
                $data['shipping_cargus_preferinte_awb_retur_validitate'] = $this->config->get('shipping_cargus_preferinte_awb_retur_validitate');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_awb_retur'])) {
                $data['shipping_cargus_preferinte_awb_retur'] = $this->request->post['shipping_cargus_preferinte_awb_retur'];
            } else {
                $data['shipping_cargus_preferinte_awb_retur'] = $this->config->get('shipping_cargus_preferinte_awb_retur');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_print_awb_retur'])) {
                $data['shipping_cargus_preferinte_print_awb_retur'] = $this->request->post['shipping_cargus_preferinte_print_awb_retur'];
            } else {
                $data['shipping_cargus_preferinte_print_awb_retur'] = $this->config->get('shipping_cargus_preferinte_print_awb_retur');
            }

            if (isset($this->request->post['shipping_cargus_preferinte_package_content_text'])) {
                $data['shipping_cargus_preferinte_package_content_text'] = $this->request->post['shipping_cargus_preferinte_package_content_text'];
            } else {
                $data['shipping_cargus_preferinte_package_content_text'] = $this->config->get('shipping_cargus_preferinte_package_content_text');
            }
        }

        $data['breadcrumbs'] = array();

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('text_home'),
            'href' => $this->url->link('common/home', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('text_shipping'),
            'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('heading_title'),
            'href' => $this->url->link('extension/shipping/cargus/cargus_preferinte', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/shipping/cargus/cargus_preferinte', $data));
    }

    protected function validate() {
        if (!$this->user->hasPermission('modify', 'extension/shipping/cargus/cargus_preferinte')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        if (!empty($this->request->post['shipping_cargus_preferinte_awb_retur_validitate'])) {
            //must be integer
            if (!filter_var($this->request->post['shipping_cargus_preferinte_awb_retur_validitate'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 0, 'max_range' => 180)))) {
                $this->error['warning'] = $this->language->get('entry_awb_retur_validitate_error');
            }
        }

        return !$this->error;
    }
}
