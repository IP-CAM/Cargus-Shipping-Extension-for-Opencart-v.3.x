<?php
require_once(DIR_CATALOG . 'model/extension/shipping/cargusclass.php');

class ControllerExtensionCargusPreferinte extends Controller {
    private $error = array();

    public function index() {
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        $this->language->load('cargus/preferinte');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');

		$data['success'] = '';
        $data['error'] = '';
        $data['error_warning'] = '';
        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			$this->model_setting_setting->editSetting('cargus_preferinte', $this->request->post);

			$data['success'] = $this->language->get('text_success');
		}

        $data['heading_title'] = $this->language->get('heading_title');

        $data['text_edit'] = $this->language->get('text_edit');
        $data['text_choose_price'] = $this->language->get('text_choose_price');
        $data['text_choose_pickup'] = $this->language->get('text_choose_pickup');
        $data['text_no'] = $this->language->get('text_no');
        $data['text_yes'] = $this->language->get('text_yes');
        $data['text_cash'] = $this->language->get('text_cash');
        $data['text_bank'] = $this->language->get('text_bank');
        $data['text_sender'] = $this->language->get('text_sender');
        $data['text_recipient'] = $this->language->get('text_recipient');
        $data['text_parcel'] = $this->language->get('text_parcel');
        $data['text_envelope'] = $this->language->get('text_envelope');

        //load cargus class from catalog
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys($this->config->get('cargus_api_url'), $this->config->get('cargus_api_key'));

        // UC login user
        $fields = array(
            'UserName' => $this->config->get('cargus_username'),
            'Password' => $this->config->get('cargus_password')
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

            $data['cargus_preferinte_service_id_options'] = array(''=>'');
            foreach (array(1,34,39) as $elm) {
                $data['cargus_preferinte_service_id_options'][$elm] = $this->language->get('entry_service_id_'.$elm);
            }


            $data['button_save'] = $this->language->get('button_save');
            $data['button_cancel'] = $this->language->get('button_cancel');
            $data['cancel'] = $this->url->link('extension/cargus/preferinte', 'user_token=' . $this->session->data['user_token'], 'SSL');

            if (isset($this->error['warning'])) {
                $data['error_warning'] = $this->error['warning'];
            } else {
                $data['error_warning'] = '';
            }

            $data['action'] = $this->url->link('extension/cargus/preferinte', 'user_token=' . $this->session->data['user_token'], 'SSL');

            if (isset($this->request->post['cargus_preferinte_price'])) {
               $data['cargus_preferinte_price'] = $this->request->post['cargus_preferinte_price'];
            } else {
               $data['cargus_preferinte_price'] = $this->config->get('cargus_preferinte_price');
            }

            if (isset($this->request->post['cargus_preferinte_pickup'])) {
                $data['cargus_preferinte_pickup'] = $this->request->post['cargus_preferinte_pickup'];
            } else {
                $data['cargus_preferinte_pickup'] = $this->config->get('cargus_preferinte_pickup');
            }

            if (isset($this->request->post['cargus_preferinte_pickup_locality'])) {
                $data['cargus_preferinte_pickup_locality'] = $this->request->post['cargus_preferinte_pickup_locality'];
            } else {
                $data['cargus_preferinte_pickup_locality'] = $this->config->get('cargus_preferinte_pickup_locality');
            }

            if (isset($this->request->post['cargus_preferinte_insurance'])) {
                $data['cargus_preferinte_insurance'] = $this->request->post['cargus_preferinte_insurance'];
            } else {
                $data['cargus_preferinte_insurance'] = $this->config->get('cargus_preferinte_insurance');
            }

            if (isset($this->request->post['cargus_preferinte_saturday'])) {
                $data['cargus_preferinte_saturday'] = $this->request->post['cargus_preferinte_saturday'];
            } else {
                $data['cargus_preferinte_saturday'] = $this->config->get('cargus_preferinte_saturday');
            }

            if (isset($this->request->post['cargus_preferinte_morning'])) {
                $data['cargus_preferinte_morning'] = $this->request->post['cargus_preferinte_morning'];
            } else {
                $data['cargus_preferinte_morning'] = $this->config->get('cargus_preferinte_morning');
            }

            if (isset($this->request->post['cargus_preferinte_openpackage'])) {
                $data['cargus_preferinte_openpackage'] = $this->request->post['cargus_preferinte_openpackage'];
            } else {
                $data['cargus_preferinte_openpackage'] = $this->config->get('cargus_preferinte_openpackage');
            }

            if (isset($this->request->post['cargus_preferinte_repayment'])) {
                $data['cargus_preferinte_repayment'] = $this->request->post['cargus_preferinte_repayment'];
            } else {
                $data['cargus_preferinte_repayment'] = $this->config->get('cargus_preferinte_repayment');
            }

            if (isset($this->request->post['cargus_preferinte_payer'])) {
                $data['cargus_preferinte_payer'] = $this->request->post['cargus_preferinte_payer'];
            } else {
                $data['cargus_preferinte_payer'] = $this->config->get('cargus_preferinte_payer');
            }

            if (isset($this->request->post['cargus_preferinte_type'])) {
                $data['cargus_preferinte_type'] = $this->request->post['cargus_preferinte_type'];
            } else {
                $data['cargus_preferinte_type'] = $this->config->get('cargus_preferinte_type');
            }

            if (isset($this->request->post['cargus_preferinte_free'])) {
                $data['cargus_preferinte_free'] = $this->request->post['cargus_preferinte_free'];
            } else {
                $data['cargus_preferinte_free'] = $this->config->get('cargus_preferinte_free');
            }

            if (isset($this->request->post['cargus_preferinte_fixed'])) {
                $data['cargus_preferinte_fixed'] = $this->request->post['cargus_preferinte_fixed'];
            } else {
                $data['cargus_preferinte_fixed'] = $this->config->get('cargus_preferinte_fixed');
            }

            if (isset($this->request->post['cargus_preferinte_noextrakm'])) {
                $data['cargus_preferinte_noextrakm'] = $this->request->post['cargus_preferinte_noextrakm'];
            } else {
                $data['cargus_preferinte_noextrakm'] = $this->config->get('cargus_preferinte_noextrakm');
            }

            if (isset($this->request->post['cargus_preferinte_service_id'])) {
                $data['cargus_preferinte_service_id'] = $this->request->post['cargus_preferinte_service_id'];
            } else {
                $data['cargus_preferinte_service_id'] = $this->config->get('cargus_preferinte_service_id');
            }

            $theme = $this->config->get('config_theme');

            if ($theme != 'journal3') {
                $data['cargus_preferinte_postal_codes'] = $this->config->get( 'cargus_preferinte_postal_codes' );

                if ( $this->request->server['REQUEST_METHOD'] == 'POST' ) {
                    $data['cargus_preferinte_postal_codes'] = 0;
                    if ( isset( $this->request->post['cargus_preferinte_postal_codes'] ) ) {
                        $data['cargus_preferinte_postal_codes'] = $this->request->post['cargus_preferinte_postal_codes'];
                    }
                }
            }
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
            'href'      => $this->url->link('extension/cargus/preferinte', 'user_token=' . $this->session->data['user_token'], 'SSL')
        );

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/cargus/preferinte', $data));
    }

    protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/cargus/preferinte')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}
}