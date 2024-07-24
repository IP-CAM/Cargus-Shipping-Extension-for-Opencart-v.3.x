<?php
require_once(DIR_CATALOG . 'model/extension/shipping/cargusclass.php');

class ControllerExtensionShippingCargusIstoric extends Controller {
    private $error = array();

    public function index(){

        $this->load->language('extension/shipping/cargus_istoric');

		$this->document->setTitle($this->language->get('heading_title'));

		$data['success'] = '';
        $data['error'] = '';
        $data['error_warning'] = '';

        if (isset($_GET['LocationId'])) {
            $pickup = $this->request->get['LocationId'];
        } else {
            $pickup = $this->config->get('shipping_cargus_preferinte_pickup');
        }

        $data['shipping_cargus_preferinte_pickup']  = $pickup;

        $data['user_token'] = $this->session->data['user_token'];

        $data['view_url'] = $this->url->link('extension/shipping/cargus_istoric', 'user_token=' . $this->session->data['user_token'], true);

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

        if (is_array($token)) {
            $data['valid'] = false;
            $data['error'] = $this->language->get('text_error') . $token['data'];
        } else {
            $data['valid'] = true;

            if (isset($_GET['BarCode'])) {
                $data['zone'] = 'awb_details';

                // UC get detalii awb
                $data['detaliuAwb'] = $this->model_shipping_cargusclass->CallMethod('Awbs?&barCode=' . $this->request->get['BarCode'], array(), 'GET', $token);
                if (is_array($data['detaliuAwb']) && count($data['detaliuAwb']) == 1) {
                    $data['detaliuAwb'] = $data['detaliuAwb'][0];
                }
            } elseif (isset($_GET['OrderId'])) {
                $data['zone'] = 'awbs';
                $data['OrderId'] = $this->request->get['OrderId'];

                // UC get istoric awb-uri comanda
                $data['awbs'] = $this->model_shipping_cargusclass->CallMethod('Awbs?&orderId=' . $this->request->get['OrderId'], array(), 'GET', $token);
            } else {
                $data['zone'] = 'orders';

                // obtine lista punctelor de ridicare
                $data['pickups'] = $this->model_shipping_cargusclass->CallMethod('PickupLocations', array(), 'GET', $token);
                if (is_null($data['pickups'])) {
                    $data['valid'] = false;
                    $data['error'] = $this->language->get('text_error').'Nu exista niciun punct de ridicare asociat acestui cont!';
                }

                // UC get istoric comenzi
                $data['orders'] = $this->model_shipping_cargusclass->CallMethod('Orders?locationId='.$pickup.'&status=1&pageNumber=1&itemsPerPage=100', array(), 'GET', $token);
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
            'href' => $this->url->link('extension/shipping/cargus_istoric', 'user_token=' . $this->session->data['user_token'] . '&LocationId=' .$pickup, true)
        );

        if (isset($_GET['OrderId'])) {
            $data['breadcrumbs'][] = array(
                'text' => $this->language->get('text_orderdetails'),
                'href' => $this->url->link('extension/shipping/cargus_istoric', 'user_token=' . $this->session->data['user_token'] . '&LocationId=' .$pickup . '&OrderId=' . $this->request->get['OrderId'], true)
            );
        }

        if (isset($_GET['BarCode'])) {
            $data['breadcrumbs'][] = array(
                'text'      => $this->language->get('text_awbdetails'),
                'href'      => $this->url->link('extension/shipping/cargus_istoric', 'user_token=' . $this->session->data['user_token'] . '&LocationId=' .$pickup . '&OrderId=' . $this->request->get['OrderId'] . '&BarCode=' . $this->request->get['BarCode'], 'SSL')
            );
        }

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/shipping/cargus_istoric', $data));
    }

    protected function install() {
        $this->load->model('user/user_group');

        $this->model_user_user_group->addPermission($this->user->getId(), 'access', 'extension/shipping/cargus_istoric');
        $this->model_user_user_group->addPermission($this->user->getId(), 'modify', 'extension/shipping/cargus_istoric');
    }
}