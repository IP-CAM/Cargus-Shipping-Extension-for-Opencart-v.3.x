<?php
class ControllerExtensionCargusIstoric extends Controller {
    private $error = array();

    public function index(){

        $this->language->load('cargus/istoric');

		$this->document->setTitle($this->language->get('heading_title'));

		$data['success'] = '';
        $data['error'] = '';
        $data['error_warning'] = '';
        $data['heading_title'] = $this->language->get('heading_title');
        $data['text_edit'] = $this->language->get('text_edit');
        $data['text_view'] = $this->language->get('text_view');
        $data['text_viewawb'] = $this->language->get('text_viewawb');
        $data['text_noresults'] = $this->language->get('text_noresults');
        $data['text_noresultsawb'] = $this->language->get('text_noresultsawb');
        $data['text_nodata'] = $this->language->get('text_nodata');
        $data['text_pickup'] = $this->language->get('text_pickup');
        $data['text_changepickup'] = $this->language->get('text_changepickup');
        $data['text_idcomanda'] = $this->language->get('text_idcomanda');
        $data['text_datavalidare'] = $this->language->get('text_datavalidare');
        $data['text_intervalridicare'] = $this->language->get('text_intervalridicare');
        $data['text_dataprocesare'] = $this->language->get('text_dataprocesare');
        $data['text_awburi'] = $this->language->get('text_awburi');
        $data['text_plicuri'] = $this->language->get('text_plicuri');
        $data['text_colete'] = $this->language->get('text_colete');
        $data['text_greutate'] = $this->language->get('text_greutate');
        $data['text_status'] = $this->language->get('text_status');
        $data['text_serieclient'] = $this->language->get('text_serieclient');
        $data['text_numarawb'] = $this->language->get('text_numarawb');
        $data['text_numedestinatar'] = $this->language->get('text_numedestinatar');
        $data['text_localitatedestinatar'] = $this->language->get('text_localitatedestinatar');
        $data['text_cost'] = $this->language->get('text_cost');
        $data['text_awb_expeditor'] = $this->language->get('text_awb_expeditor');
        $data['text_awb_destinatar'] = $this->language->get('text_awb_destinatar');
        $data['text_awb_nume'] = $this->language->get('text_awb_nume');
        $data['text_awb_judet'] = $this->language->get('text_awb_judet');
        $data['text_awb_localitate'] = $this->language->get('text_awb_localitate');
        $data['text_awb_strada'] = $this->language->get('text_awb_strada');
        $data['text_awb_numar'] = $this->language->get('text_awb_numar');
        $data['text_awb_adresa'] = $this->language->get('text_awb_adresa');
        $data['text_awb_perscontact'] = $this->language->get('text_awb_perscontact');
        $data['text_awb_telefon'] = $this->language->get('text_awb_telefon');
        $data['text_awb_email'] = $this->language->get('text_awb_email');
        $data['text_awb_detaliiawb'] = $this->language->get('text_awb_detaliiawb');
        $data['text_awb_codbara'] = $this->language->get('text_awb_codbara');
        $data['text_awb_valoaredeclarata'] = $this->language->get('text_awb_valoaredeclarata');
        $data['text_awb_rambursnumerar'] = $this->language->get('text_awb_rambursnumerar');
        $data['text_awb_ramburscont'] = $this->language->get('text_awb_ramburscont');
        $data['text_awb_rambursalt'] = $this->language->get('text_awb_rambursalt');
        $data['text_awb_deschidere'] = $this->language->get('text_awb_deschidere');
        $data['text_awb_livraresambata'] = $this->language->get('text_awb_livraresambata');
        $data['text_awb_livraredimineata'] = $this->language->get('text_awb_livraredimineata');
        $data['text_awb_plataexpeditie'] = $this->language->get('text_awb_plataexpeditie');
        $data['text_awb_observatii'] = $this->language->get('text_awb_observatii');
        $data['text_awb_continut'] = $this->language->get('text_awb_continut');
        $data['text_awb_serieclient'] = $this->language->get('text_awb_serieclient');
        $data['text_da'] = $this->language->get('text_da');
        $data['text_nu'] = $this->language->get('text_nu');

        if (isset($_GET['LocationId'])) {
            $pickup = $this->request->get['LocationId'];
        } else {
            $pickup = $this->config->get('cargus_preferinte_pickup');
        }

        $data['cargus_preferinte_pickup']  = $pickup;
        $data['user_token'] = $this->session->data['user_token'];
        $data['view_url'] = $this->url->link('extension/cargus/istoric', 'user_token=' . $this->session->data['user_token'], 'SSL');

        // instantiez clasa cargus
        require(DIR_CATALOG.'model/extension/shipping/cargusclass.php');
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass();

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
            'text'      => $this->language->get('text_home'),
            'href'      => $this->url->link('common/home', 'user_token=' . $this->session->data['user_token'], 'SSL')
        );
        $data['breadcrumbs'][] = array(
            'text'      => $this->language->get('text_shipping'),
            'href'      => $this->url->link('extension/shipping', 'user_token=' . $this->session->data['user_token'], 'SSL')
        );
        $data['breadcrumbs'][] = array(
            'text'      => $this->language->get('heading_title'),
            'href'      => $this->url->link('extension/cargus/istoric', 'user_token=' . $this->session->data['user_token'] . '&LocationId=' .$pickup, 'SSL')
        );

        if (isset($_GET['OrderId'])) {
            $data['breadcrumbs'][] = array(
                'text'      => $this->language->get('text_orderdetails'),
                'href'      => $this->url->link('extension/cargus/istoric', 'user_token=' . $this->session->data['user_token'] . '&LocationId=' .$pickup . '&OrderId=' . $this->request->get['OrderId'], 'SSL')
            );
        }

        if (isset($_GET['BarCode'])) {
            $data['breadcrumbs'][] = array(
                'text'      => $this->language->get('text_awbdetails'),
                'href'      => $this->url->link('extension/cargus/istoric', 'user_token=' . $this->session->data['user_token'] . '&LocationId=' .$pickup . '&OrderId=' . $this->request->get['OrderId'] . '&BarCode=' . $this->request->get['BarCode'], 'SSL')
            );
        }

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/cargus/istoric', $data));
    }

    protected function install() {
        $this->load->model('user/user_group');

        $this->model_user_user_group->addPermission($this->user->getId(), 'access', 'extension/cargus/istoric');
        $this->model_user_user_group->addPermission($this->user->getId(), 'modify', 'extension/cargus/istoric');
    }
}