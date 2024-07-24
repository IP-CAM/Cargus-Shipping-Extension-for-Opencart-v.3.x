<?php
class ControllerExtensionCargusShipAndGo extends Controller
{
    private $error = array();

    public function index()
    {

        $this->language->load('cargus/ship_and_go');

        $this->document->setTitle($this->language->get('heading_title'));

        $this->load->model('setting/setting');

        $data['success'] = '';
        $data['error'] = '';
        $data['error_warning'] = '';
        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $this->model_setting_setting->editSetting('cargus_shipping_preferinte', $this->request->post);
            $data['success'] = $this->language->get('text_success');
            $this->model_setting_setting->editSetting('shipping_cargus_ship_and_go', ['shipping_cargus_ship_and_go_status' => $this->request->post['cargus_shipping_preferinte_status']]);
            $this->alterTable();
        }
        $data['valid'] = true;
        $data['heading_title'] = $this->language->get('heading_title');
        $data['text_edit'] = $this->language->get('text_edit');
        $data['text_choose_price'] = $this->language->get('text_choose_price');
        $data['text_choose_pickup'] = $this->language->get('text_choose_pickup');
        $data['text_no'] = $this->language->get('text_no');
        $data['text_yes'] = $this->language->get('text_yes');

        $data['entry_status'] = $this->language->get('entry_status');
        $data['entry_status_details'] = $this->language->get('entry_status_details');



        $data['entry_free'] = $this->language->get('entry_free');
        $data['entry_free_details'] = $this->language->get('entry_free_details');
        $data['entry_fixed'] = $this->language->get('entry_fixed');
        $data['entry_fixed_details'] = $this->language->get('entry_fixed_details');
        $data['entry_fixed'] = $this->language->get('entry_fixed');
        $data['entry_fixed_details'] = $this->language->get('entry_fixed_details');
        $data['button_save'] = $this->language->get('button_save');
        $data['button_cancel'] = $this->language->get('button_cancel');
        $data['cancel'] = $this->url->link('extension/cargus/ship_and_go', 'user_token=' . $this->session->data['user_token'], 'SSL');

        if (isset($this->error['warning'])) {
            $data['error_warning'] = $this->error['warning'];
        } else {
            $data['error_warning'] = '';
        }

        $data['action'] = $this->url->link('extension/cargus/ship_and_go', 'user_token=' . $this->session->data['user_token'], 'SSL');


        if (isset($this->request->post['cargus_shipping_preferinte_free'])) {
            $data['cargus_shipping_preferinte_free'] = $this->request->post['cargus_shipping_preferinte_free'];
        } else {
            $data['cargus_shipping_preferinte_free'] = $this->config->get('cargus_shipping_preferinte_free');
        }

        if (isset($this->request->post['cargus_shipping_preferinte_fixed'])) {
            $data['cargus_shipping_preferinte_fixed'] = $this->request->post['cargus_shipping_preferinte_fixed'];
        } else {
            $data['cargus_shipping_preferinte_fixed'] = $this->config->get('cargus_shipping_preferinte_fixed');
        }

        if (isset($this->request->post['cargus_shipping_preferinte_status'])) {
            $data['cargus_shipping_preferinte_status'] = $this->request->post['cargus_shipping_preferinte_status'];
        } else {
            $data['cargus_shipping_preferinte_status'] = $this->config->get('cargus_shipping_preferinte_status');
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
            'href'      => $this->url->link('extension/cargus/ship_and_go', 'user_token=' . $this->session->data['user_token'], 'SSL')
        );

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/cargus/ship_and_go', $data));
    }

    protected function validate()
    {
        if (!$this->user->hasPermission('modify', 'extension/cargus/ship_and_go')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        return !$this->error;
    }

    private function alterTable(){
        try{
            $sql = "ALTER TABLE awb_cargus ADD COLUMN pudo_location_id INT AFTER shipping_code";
            $this->db->query($sql);
        }catch(Exception $e){
            // whe need to avoid DB error
            //$this->log->write('Error alter table: ' . $e->getMessage());
        }
    }
}
