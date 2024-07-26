<?php
class ControllerExtensionShippingCargusShipAndGo extends Controller
{
    private $error = array();

    public function index() {

        $this->load->language('extension/shipping/cargus_ship_and_go');

        $this->document->setTitle($this->language->get('heading_title'));

        $this->load->model('setting/setting');

        $data['success'] = '';
        $data['error'] = '';
        $data['error_warning'] = '';
		
        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $this->model_setting_setting->editSetting('shipping_cargus_shipping_preferinte', $this->request->post);

            $data['success'] = $this->language->get('text_success');

            $this->model_setting_setting->editSetting('shipping_cargus_ship_and_go', ['shipping_cargus_ship_and_go_status' => $this->request->post['cargus_shipping_preferinte_status']]);

            $this->alterTable();
        }
		
        $data['valid'] = true;
		
        $data['cancel'] = $this->url->link('extension/shipping/cargus_ship_and_go', 'user_token=' . $this->session->data['user_token'], true);

        if (isset($this->error['warning'])) {
            $data['error_warning'] = $this->error['warning'];
        } else {
            $data['error_warning'] = '';
        }

        $data['action'] = $this->url->link('extension/shipping/cargus_ship_and_go', 'user_token=' . $this->session->data['user_token'], true);


        if (isset($this->request->post['shipping_cargus_shipping_preferinte_free'])) {
            $data['shipping_cargus_shipping_preferinte_free'] = $this->request->post['shipping_cargus_shipping_preferinte_free'];
        } else {
            $data['shipping_cargus_shipping_preferinte_free'] = $this->config->get('shipping_cargus_shipping_preferinte_free');
        }

        if (isset($this->request->post['shipping_cargus_shipping_preferinte_fixed'])) {
            $data['shipping_cargus_shipping_preferinte_fixed'] = $this->request->post['shipping_cargus_shipping_preferinte_fixed'];
        } else {
            $data['shipping_cargus_shipping_preferinte_fixed'] = $this->config->get('shipping_cargus_shipping_preferinte_fixed');
        }

        if (isset($this->request->post['shipping_cargus_shipping_preferinte_status'])) {
            $data['shipping_cargus_shipping_preferinte_status'] = $this->request->post['shipping_cargus_shipping_preferinte_status'];
        } else {
            $data['shipping_cargus_shipping_preferinte_status'] = $this->config->get('shipping_cargus_shipping_preferinte_status');
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
            'href' => $this->url->link('extension/shipping/cargus_ship_and_go', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/shipping/cargus_ship_and_go', $data));
    }

    protected function validate()
    {
        if (!$this->user->hasPermission('modify', 'extension/shipping/cargus_ship_and_go')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        return !$this->error;
    }

    private function alterTable(){
        try{
            $sql = "ALTER TABLE `" . DB_PREFIX . "awb_cargus` ADD COLUMN pudo_location_id INT AFTER shipping_code";
            $this->db->query($sql);
        }catch(Exception $e){
            // whe need to avoid DB error
            //$this->log->write('Error alter table: ' . $e->getMessage());
        }
    }
}
