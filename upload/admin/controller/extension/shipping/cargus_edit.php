<?php
require_once(DIR_CATALOG . 'model/extension/shipping/cargusclass.php');

class ControllerExtensionShippingCargusEdit extends Controller {
    private $error = array();

    public function index(){
        $this->load->language('extension/shipping/cargus/cargus_edit');

		$this->document->setTitle($this->language->get('heading_title'));

        if (isset($this->session->data['success'])) {
            $data['success'] = $this->session->data['success'];
            $this->session->data['success'] = '';
        } else {
            $data['success'] = '';
        }

        if (isset($this->session->data['error'])) {
            $data['error'] = $this->session->data['error'];
            $this->session->data['error'] = '';
        } else {
            $data['error'] = '';
        }

        if (isset($this->session->data['error_warning'])) {
            $data['error_warning'] = $this->session->data['error_warning'];
            $this->session->data['error_warning'] = '';
        } else {
            $data['error_warning'] = '';
        }

        $data['cancel'] = $this->url->link('extension/shipping/cargus/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true);

        // instantiez clasa cargus
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys($this->config->get('shipping_cargus_api_url'), $this->config->get('shipping_cargus_api_key'));

        // UC login user
        $fields = array(
            'UserName' => $this->config->get('shipping_cargus_username'),
            'Password' => $this->config->get('shipping_cargus_password')
        );
        $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

        // selectez awb-ul pentru editare
        $awb = $this->db->query("SELECT * FROM `" . DB_PREFIX . "awb_cargus` WHERE id = '".$this->request->get['awb']."' ORDER BY id ASC LIMIT 0, 1");
        $data['awb'] = $awb;

        // obtine lista punctelor de ridicare
        $data['pickups'] = $this->model_shipping_cargusclass->CallMethod('PickupLocations', array(), 'GET', $token);
        if (is_null($data['pickups'])) {
            $data['valid'] = false;
            $data['error'] = $this->language->get('text_error').'Nu exista niciun punct de ridicare asociat acestui cont!';
        }

        // preiau judetele din opencart
        $this->load->model('localisation/zone');
        $data['judete'] = $this->model_localisation_zone->getZonesByCountryId(175);

        // obtin lista de judete din api
        $judete = array();
        $dataJudete = $this->model_shipping_cargusclass->CallMethod('Counties?countryId=1', array(), 'GET', $token);
        foreach ($dataJudete as $val) {
            $judete[strtolower($val['Abbreviation'])] = $val['CountyId'];
        }

        // obtin lista de localitati pe baza abrevierii judetului
        $data['localitati'] = $this->model_shipping_cargusclass->CallMethod('Localities?countryId=1&countyId='.$judete[strtolower($data['awb']->row['county_name'])], array(), 'GET', $token);

        $data['action'] = $this->url->link('extension/shipping/cargus/cargus_edit/save', 'user_token=' . $this->session->data['user_token'].'&awb='.$this->request->get['awb'], true);

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
            'text' => $this->language->get('text_currentorder'),
            'href' => $this->url->link('extension/shipping/cargus/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('heading_title'),
            'href' => $this->url->link('extension/shipping/cargus/cargus_edit', 'user_token=' . $this->session->data['user_token'].'&awb='.$this->request->get['awb'], true)
        );

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/shipping/cargus/cargus_edit', $data));
    }

    protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/shipping/cargus/cargus_edit')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}

    public function save(){
        $this->load->language('cargus/edit');

        $this->db->query("UPDATE
                                `" . DB_PREFIX . "awb_cargus`
                            SET
                                pickup_id = '".$this->request->post['pickup_id']."',
                                name = '".$this->request->post['name']."',
                                locality_name = '".$this->request->post['city']."',
                                county_name = '".$this->request->post['zone_id']."',
                                address = '".$this->request->post['address']."',
                                postcode = '".$this->request->post['postcode']."',
                                contact = '".$this->request->post['contact']."',
                                phone = '".$this->request->post['phone']."',
                                email = '".$this->request->post['email']."',
                                parcels = '".$this->request->post['parcels']."',
                                envelopes = '".$this->request->post['envelopes']."',
                                weight = '".$this->request->post['weight']."',
                                value = '".$this->request->post['value']."',
                                cash_repayment = '".$this->request->post['cash_repayment']."',
                                bank_repayment = '".$this->request->post['bank_repayment']."',
                                other_repayment = '".$this->request->post['other_repayment']."',
                                payer = '".$this->request->post['payer']."',
                                saturday_delivery = '".$this->request->post['saturday_delivery']."',
                                morning_delivery = '".$this->request->post['morning_delivery']."',
                                openpackage = '".$this->request->post['openpackage']."',
                                observations = '".$this->request->post['observations']."',
                                contents = '".$this->request->post['contents']."',
                                shipping_code = '".$this->request->post['shipping_code']."'
                            WHERE
                                id ='".$this->request->get['awb']."'");



		$this->session->data['success'] = $this->language->get('text_success');

        $this->response->redirect($this->url->link('extension/shipping/cargus/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true));
	}

    protected function install() {
        $this->load->model('user/user_group');

        $this->model_user_user_group->addPermission($this->user->getId(), 'access', 'extension/shipping/cargus/cargus_edit');
        $this->model_user_user_group->addPermission($this->user->getId(), 'modify', 'extension/shipping/cargus/cargus_edit');
    }
}