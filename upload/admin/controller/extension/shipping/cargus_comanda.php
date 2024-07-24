<?php
require_once(DIR_CATALOG . 'model/extension/shipping/cargusclass.php');

class ControllerExtensionShippingCargusComanda extends Controller {
    private $error = array();

    public function index() {
        $this->load->language('extension/shipping/cargus_comanda');

        $this->document->setTitle($this->language->get('heading_title'));

        if (isset($_GET['LocationId'])) {
            $pickup = $this->request->get['LocationId'];
        } else {
            $pickup = $this->config->get('shipping_cargus_preferinte_pickup');
        }

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

        // instantiez clasa cargus
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys(
            $this->config->get('shipping_cargus_api_url'),
            $this->config->get('shipping_cargus_api_key')
        );

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

            // obtine lista punctelor de ridicare
            $data['pickups'] = array();

            $pickups = $this->model_shipping_cargusclass->CallMethod('PickupLocations', array(), 'GET', $token);

            if (is_null($pickups)) {
                $data['valid'] = false;
                $data['error'] = $this->language->get(
                        'text_error'
                    ) . 'Nu exista niciun punct de ridicare asociat acestui cont!';
            } else {
                foreach ($pickups as $pick) {
                    $data['pickups'][$pick['LocationId']] = $pick;
                }
            }

            // UC get comanda curenta
            $orders = $this->model_shipping_cargusclass->CallMethod(
                'Orders?locationId=' . $pickup . '&status=0&pageNumber=1&itemsPerPage=1000',
                array(),
                'GET',
                $token
            );

            // UC get awb-uri curente
            $data['listaValidate'] = array();
            if (!is_null($orders)) {
                $result = $this->model_shipping_cargusclass->CallMethod(
                    'Awbs?&orderId=' . (isset($orders['OrderId']) == 1 ? $orders['OrderId'] : $orders[0]['OrderId']),
                    array(),
                    'GET',
                    $token
                );
                if (!is_null($result)) {
                    foreach ($result as $t) {
                        if ($t['Status'] != 'Deleted') {
                            $data['listaValidate'][] = $t;
                        }
                    }
                }
            }

            // get comenzi in asteptare
            $ord = $this->db->query("SELECT * FROM `" . DB_PREFIX . "awb_cargus` WHERE barcode = '0' ORDER BY id ASC");

            $data['listaAsteptare'] = $ord;

            foreach ($data['listaAsteptare']->rows as $key => $row) {
                $data['listaAsteptare']->rows[$key]['edit_link'] = $this->url->link('extension/shipping/cargus_edit', 'user_token=' . $this->session->data['user_token'] . '&awb=' . $row['id'], true);
            }

            $data['shipping_cargus_preferinte_pickup'] = $this->config->get('shipping_cargus_preferinte_pickup');

            if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
                // sterg awb-urile selectate din lista in asteptare
                if (isset($this->request->post['action']) && $this->request->post['action'] == 'pending_delete') {
                    if (isset($this->request->post['selected'])) {
                        $this->db->query(
                            "DELETE FROM `" . DB_PREFIX . "awb_cargus` WHERE id IN(" . implode(',', $this->request->post['selected']) . ")"
                        );
                        $this->session->data['success'] = $this->language->get('text_success_delpending');
                    } else {
                        $this->session->data['error'] = $this->language->get('text_no_selection');
                    }
                }

                // sterg awb-urile selectate din lista cu validate
                if (isset($this->request->post['action']) && $this->request->post['action'] == 'validated_invalidate') {
                    if (isset($this->request->post['awbs'])) {
                        foreach ($this->request->post['awbs'] as $barcode) {
                            $result = $this->model_shipping_cargusclass->CallMethod(
                                'Awbs?barCode=' . $barcode,
                                array(),
                                'DELETE',
                                $token
                            );
                            $this->db->query("UPDATE `" . DB_PREFIX . "awb_cargus` SET `barcode` = '0',`ReturnAwb`=NULL,`ReturnCode`=NULL WHERE barcode = '" . $barcode . "'");
                        }
                        $this->session->data['success'] = $this->language->get('text_success_delvalidated');
                    } else {
                        $this->session->data['error'] = $this->language->get('text_no_selection');
                    }
                }

                // validez awb-urile din lista de asteptare
                if (isset($this->request->post['action']) && $this->request->post['action'] == 'pending_validate') {
                    if (isset($this->request->post['selected'])) {
                        //process awb validation
                        $this->validateAwb($this->request->post['selected'], $token);
                    } else {
                        $this->session->data['error'] = $this->language->get('text_no_selection');
                    }
                }
                $this->response->redirect($this->url->link('extension/shipping/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true));
            }
        }

        $data['url_print'] = $this->url->link('extension/shipping/cargus_comanda/print_awbs', 'user_token=' . $this->session->data['user_token'], true);

        $data['url_order'] = $this->url->link('extension/shipping/cargus_comanda/validate_order', 'user_token=' . $this->session->data['user_token'], true);

        $data['form_action'] = $this->url->link('extension/shipping/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true);
        $data['form_filter_action'] = $this->url->link('extension/shipping/cargus_comanda/change_pickup', 'user_token=' . $this->session->data['user_token'], true);

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
            'href' => $this->url->link('extension/shipping/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true)
        );

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/shippin/cargus_comanda', $data));
    }

    protected function validate() {
        if (!$this->user->hasPermission('modify', 'extension/shipping/cargus_comanda')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        return !$this->error;
    }

    public function change_pickup()
    {
        $this->load->model('setting/setting');

        $sets = $this->model_setting_setting->getSetting('shipping_cargus_preferinte');
        $sets['shipping_cargus_preferinte_pickup'] = $this->request->post['LocationId'];

        $this->model_setting_setting->editSetting('shipping_cargus_preferinte', $sets);
        $this->response->redirect(
            $this->url->link('extension/shipping/cargus_comanda', 'user_token=' . $this->session->data['user_token'], true)
        );
    }

    public function print_awbs()
    {
        // instantiez clasa cargus
        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys(
            $this->config->get('shipping_cargus_api_url'),
            $this->config->get('shipping_cargus_api_key')
        );

        // UC login user
        $fields = array(
            'UserName' => $this->config->get('shipping_cargus_username'),
            'Password' => $this->config->get('shipping_cargus_password')
        );
        $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

        $printConsumerReturn = is_null($this->config->get('shipping_cargus_preferinte_print_awb_retur')) ?
            0:
            $this->config->get('shipping_cargus_preferinte_print_awb_retur');

        // UC print
        $print = $this->model_shipping_cargusclass->CallMethod(
            'AwbDocuments?type=PDF&format=' . $this->request->get['format'] . '&barCodes=' .
            $this->request->get['bar_codes'] . '&printReturn=' . $printConsumerReturn,
            array(),
            'GET',
            $token
        );

        header('Content-type:application/pdf');
        echo base64_decode($print);
        die();
    }

    public function validate_order() {
        $this->load->language('extension/shipping/cargus_comanda');
		
        $data['url_send'] = $this->url->link('extension/shipping/cargus_comanda/send_order', 'user_token=' . $this->session->data['user_token'], true);
        $data['url_validate'] = html_entity_decode($this->url->link('extension/shipping/cargus_comanda/validate_order', 'user_token=' . $this->session->data['user_token'], true));

        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Bucharest'));
        $today = $date->format('Y-m-d H:i:s');
        if (isset($this->request->get['date'])) {
            $d = explode('.', $this->request->get['date']);
            $date->setDate($d[2], $d[1], $d[0]);
        }
        $cd = $date->format('Y-m-d H:i:s');

        if (date('w', strtotime($cd)) == 0) { // duminica
            $date = date('d.m.Y', strtotime($cd . ' +1 day'));
            $h_start = 13;
            $h_end = 18;
            $h2_start = 14;
            $h2_end = 19;
        } else {
            if (date('w', strtotime($cd)) == 1 || date('w', strtotime($cd)) == 2 || date(
                    'w',
                    strtotime($cd)
                ) == 3 || date('w', strtotime($cd)) == 4) { // luni, marti, miercuri si joi
                if ($cd == $today) {
                    if (date('H', strtotime($cd)) > 18) {
                        $date = date('d.m.Y', strtotime($cd . ' +1 day'));
                        $h_start = 13;
                        $h_end = 18;
                        $h2_start = 14;
                        $h2_end = 19;
                    } else {
                        if (date('H', strtotime($cd)) == 18) {
                            $date = date('d.m.Y', strtotime($cd));
                            $h_start = 18;
                            $h_end = 18;
                            $h2_start = 19;
                            $h2_end = 19;
                        } else {
                            $date = date('d.m.Y', strtotime($cd));
                            $h_start = date('H', strtotime($cd)) + 1;
                            $h_end = 18;
                            $h2_start = date('H', strtotime($cd)) + 2;
                            $h2_end = 19;
                        }
                    }
                } else {
                    $date = date('d.m.Y', strtotime($cd));
                    $h_start = 13;
                    $h_end = 18;
                    $h2_start = 14;
                    $h2_end = 19;
                }
            } else {
                if (date('w', strtotime($cd)) == 5) { // vineri
                    if ($cd == $today) {
                        if (date('H', strtotime($cd)) > 18) {
                            $date = date('d.m.Y', strtotime($cd . ' +1 day'));
                            $h_start = 13;
                            $h_end = 14;
                            $h2_start = 14;
                            $h2_end = 15;
                        } else {
                            if (date('H', strtotime($cd)) == 18) {
                                $date = date('d.m.Y', strtotime($cd));
                                $h_start = 18;
                                $h_end = 18;
                                $h2_start = 19;
                                $h2_end = 19;
                            } else {
                                $date = date('d.m.Y', strtotime($cd));
                                $h_start = date('H', strtotime($cd)) + 1;
                                $h_end = 18;
                                $h2_start = date('H', strtotime($cd)) + 2;
                                $h2_end = 19;
                            }
                        }
                    } else {
                        $date = date('d.m.Y', strtotime($cd));
                        $h_start = 13;
                        $h_end = 18;
                        $h2_start = 14;
                        $h2_end = 19;
                    }
                } else {
                    if (date('w', strtotime($cd)) == 6) { // sambata
                        if ($cd == $today) {
                            if (date('H', strtotime($cd)) > 14) {
                                $date = date('d.m.Y', strtotime($cd . ' +2 day'));
                                $h_start = 13;
                                $h_end = 18;
                                $h2_start = 14;
                                $h2_end = 19;
                            } else {
                                if (date('H', strtotime($cd)) == 14) {
                                    $date = date('d.m.Y', strtotime($cd));
                                    $h_start = 14;
                                    $h_end = 14;
                                    $h2_start = 15;
                                    $h2_end = 15;
                                } else {
                                    $date = date('d.m.Y', strtotime($cd));
                                    $h_start = date('H', strtotime($cd)) + 1;
                                    $h_end = 14;
                                    $h2_start = date('H', strtotime($cd)) + 2;
                                    $h2_end = 15;
                                }
                            }
                        } else {
                            $date = date('d.m.Y', strtotime($cd));
                            $h_start = 13;
                            $h_end = 14;
                            $h2_start = 14;
                            $h2_end = 15;
                        }
                    }
                }
            }
        }

        $data['date'] = $date;

        if (isset($this->request->get['hour'])) {
            $h = explode(':', $this->request->get['hour']);
            $h2_start = $h[0] + 1;
            $hour = $this->request->get['hour'];
        } else {
            $hour = false;
        }

        $html = '';
        for ($i = $h_start; $i <= $h_end; $i++) {
            $html .= '<option' . ($hour == $i . ':00' ? ' selected="selected"' : '') . '>' . $i . ':00</option>';
        }
        $data['h_dela'] = $html;

        $html = '';
        for ($i = $h2_start; $i <= $h2_end; $i++) {
            $html .= '<option>' . $i . ':00</option>';
        }
        $data['h_panala'] = $html;

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/shipping/cargus_finalizare', $data));
    }

    public function send_order() {
        if ($this->request->server['REQUEST_METHOD'] == 'POST') {
            // instantiez clasa cargus
            $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

            // setez url si key
            $this->model_shipping_cargusclass->SetKeys(
                $this->config->get('shipping_cargus_api_url'),
                $this->config->get('shipping_cargus_api_key')
            );

            // UC login user
            $fields = array(
                'UserName' => $this->config->get('shipping_cargus_username'),
                'Password' => $this->config->get('shipping_cargus_password')
            );
            $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

            $d = explode('.', $this->request->post['date']);
            $from = $d[2] . '-' . $d[1] . '-' . $d[0] . ' ' . $this->request->post['hour_from'] . ':00';
            $to = $d[2] . '-' . $d[1] . '-' . $d[0] . ' ' . $this->request->post['hour_to'] . ':00';

            // UC send order
            $order_id = $this->model_shipping_cargusclass->CallMethod(
                'Orders?locationId=' . $this->config->get('shipping_cargus_preferinte_pickup') . '&PickupStartDate=' . date(
                    'Y-m-d%20H:i:s',
                    strtotime($from)
                ) . '&PickupEndDate=' . date('Y-m-d%20H:i:s', strtotime($to)) . '&action=1',
                array(),
                'PUT',
                $token
            );

            $url_borderou = $this->url->link('extension/shipping/cargus_comanda/print_summary', 'user_token=' . $this->session->data['user_token'], true);
            echo '<script>window.opener.location.reload(); window.resizeTo(916, 669); window.location = "' . html_entity_decode(
                    $url_borderou
                ) . '&order_id=' . $order_id . '";</script>';
        }
    }

    public function print_summary()
    {
        if ($this->request->get['order_id']) {
            // instantiez clasa cargus
            $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

            // setez url si key
            $this->model_shipping_cargusclass->SetKeys(
                $this->config->get('shipping_cargus_api_url'),
                $this->config->get('shipping_cargus_api_key')
            );

            // UC login user
            $fields = array(
                'UserName' => $this->config->get('shipping_cargus_username'),
                'Password' => $this->config->get('shipping_cargus_password')
            );
            $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');

            // UC print borderou
            $borderou = $this->model_shipping_cargusclass->CallMethod(
                'OrderDocuments?orderId=' . $this->request->get['order_id'] . '&docType=0',
                array(),
                'GET',
                $token
            );

            header('Content-type:application/pdf');
            echo base64_decode($borderou);
            die();
        }
    }

    protected function install() {
        $this->load->model('user/user_group');

        $this->model_user_user_group->addPermission($this->user->getId(), 'access', 'extension/shipping/cargus_comanda');
        $this->model_user_user_group->addPermission($this->user->getId(), 'modify', 'extension/shipping/cargus_comanda');
    }

    public function validateAwb($order_ids, $token = null) {
        $errors = array();
        $successes = array();
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        $this->load->language('extension/shipping/cargus_comanda');

        $this->model_shipping_cargusclass = new ModelExtensionShippingCargusClass($this->registry);

        // setez url si key
        $this->model_shipping_cargusclass->SetKeys(
            $this->config->get('shipping_cargus_api_url'),
            $this->config->get('shipping_cargus_api_key')
        );

        if (is_null($token)) {
            // UC login user
            $fields = array(
                'UserName' => $this->config->get('shipping_cargus_username'),
                'Password' => $this->config->get('shipping_cargus_password')
            );
            $token = $this->model_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');
        }

        foreach ($order_ids as $id) {
            $row = $this->db->query(
                "SELECT * FROM `" . DB_PREFIX . "awb_cargus WHERE` barcode = '0' AND id = '" . addslashes($id) . "'"
            );

            if (!isset($row->row['postcode']) || !$row->row['postcode']) {
                $errors[] = $this->language->get('text_postalcode') . ' ' .
                            (isset($row->row['order_id']) ? $row->row['order_id'] : 'NULL');
                continue;
            } else {
                if ($row->row['shipping_code'] == 'cargus.franciza') {
                    // se trimite catre franciza Cargus si nu catre adresa destinatarului
                    $CountyName = $row->row['county_name'];
                    $LocalityName = $row->row['locality_name'];
                    $Address = 'Se va ridica de la sediul Cargus!';
                    $Observations = 'SE VA RIDICA DE LA SEDIUL CARGUS | ' . $row->row['observations'];
                } else {
                    // se trimite catre adresa destinatarului
                    $CountyName = $row->row['county_name'];
                    $LocalityName = $row->row['locality_name'];
                    $Address = $row->row['address'];
                    $Observations = $row->row['observations'];
                }

                if ($row->num_rows > 0) {
                    $cargus_preferinte_package_content_text = $this->config->get('shipping_cargus_preferinte_package_content_text');

                    //privacy is needed so override packagecontent sent
                    if (!empty($cargus_preferinte_package_content_text)) {
                        $row->row['contents'] = $cargus_preferinte_package_content_text;
                    }

                    $fields = array(
                        'Sender' => array(
                            'LocationId' => $row->row['pickup_id']
                        ),
                        'Recipient' => array(
                            'LocationId' => null,
                            'Name' => $row->row['name'],
                            'CountyId' => null,
                            'CountyName' => $CountyName,
                            'LocalityId' => null,
                            'LocalityName' => $LocalityName,
                            'StreetId' => null,
                            'StreetName' => '-',
                            'AddressText' => $Address,
                            'ContactPerson' => $row->row['contact'],
                            'PhoneNumber' => $row->row['phone'],
                            'Email' => $row->row['email'],
                            'CodPostal' => $row->row['postcode']
                        ),
                        'Parcels' => $row->row['parcels'],
                        'Envelopes' => $row->row['envelopes'],
                        'TotalWeight' => $row->row['weight'],
                        'DeclaredValue' => $row->row['value'],
                        'CashRepayment' => $row->row['cash_repayment'],
                        'BankRepayment' => $row->row['bank_repayment'],
                        'OtherRepayment' => $row->row['other_repayment'],
                        'PriceTableId' => $this->config->get('shipping_cargus_preferinte_price'),
                        'OpenPackage' => $row->row['openpackage'] == 1 ? true : false,
                        'ShipmentPayer' => $row->row['payer'],
                        'MorningDelivery' => $row->row['morning_delivery'] == 1 ? true : false,
                        'SaturdayDelivery' => $row->row['saturday_delivery'] == 1 ? true : false,
                        'Observations' => $Observations,
                        'PackageContent' => $row->row['contents'],
                        'CustomString' => $row->row['order_id']
                    );

                    $fields['ConsumerReturnType'] = is_null($this->config->get('shipping_cargus_preferinte_awb_retur')) ?
                        0 :
                        $this->config->get('shipping_cargus_preferinte_awb_retur');

                    $fields['ReturnCodeExpirationDays'] = $this->config->get('shipping_cargus_preferinte_awb_retur_validitate');

                    for ($i = 1; $i <= $row->row['parcels']; $i++) {
                        $fields['ParcelCodes'][] = array(
                            'Code' => 'C' . $i,
                            'Type' => 1,
                            'Weight' => 1,
                            'Length' => 20,
                            'Width' => 20,
                            'Height' => 10
                        );
                    }

                    for ($i = 1; $i <= $row->row['envelopes']; $i++) {
                        $fields['ParcelCodes'][] = array(
                            'Code' => 'P' . $i,
                            'Type' => 0
                        );
                    }

                    $fields['ServiceId'] = 0;
                    if($this->config->get('shipping_cargus_preferinte_service_id')){
                        $fields['ServiceId'] = $this->config->get('shipping_cargus_preferinte_service_id');
                    }

                    if ($row->row['shipping_code'] == 'shipping_cargus_ship_and_go.ship_and_go') {
                        if (!empty($row->row['pudo_location_id'])) {
                            $fields['DeliveryPudoPoint'] = $row->row['pudo_location_id'];
                        }
                        $fields['ServiceId'] = 38;// $this->config->get('shipping_cargus_shipping_preferinte_service_id'); //38
                        $fields['CashRepayment']     = 0;
                        $fields['ShipmentPayer']     = 1;
                        $fields['SaturdayDelivery']  = false;

                        //remove client address
                        unset( $fields['Recipient']['LocationId'] );
                        unset( $fields['Recipient']['CountyId'] );
                        unset( $fields['Recipient']['CountyName'] );
                        unset( $fields['Recipient']['LocalityId'] );
                        unset( $fields['Recipient']['LocalityName'] );
                        unset( $fields['Recipient']['StreetId'] );
                        unset( $fields['Recipient']['StreetName'] );
                        unset( $fields['Recipient']['AddressText'] );
                        unset( $fields['Recipient']['CodPostal'] );

                        unset( $fields['OpenPackage'] );
                    }
                    /*elseif (in_array($this->config->get('shipping_cargus_preferinte_service_id'), array(34))) {
                        if ($row->row['weight'] <= 31) {
                            $fields['ServiceId'] = 34;
                        } elseif ($row->row['weight'] <= 50) {
                            $fields['ServiceId'] = 35;
                        } else {
                            $fields['ServiceId'] = 36;
                        }
                    }*/

//                    $this->log->write('Create AWB, data:' . print_r($fields, true));

                    //Awbs
                    //Awbs/WithGetAwb
                    $cod_bara = $this->model_shipping_cargusclass->CallMethod(
                        'Awbs/WithGetAwb',
                        $fields,
                        'POST',
                        $token
                    );

//                    $this->log->write('Return AWB data: ' . print_r($cod_bara, true));

                    if (is_array($cod_bara) && isset($cod_bara['error'])) {
                        $this->log->write('Create AWB error, array branch, return data:' . print_r($cod_bara, true));

                        if (isset($cod_bara['error'])) {
                            $this->log->write('Create AWB error, data:' . print_r($fields, true));
                            $errors[] = $this->language->get(
                                    'text_order'
                                ) . ' ' . $row->row['parcels'] . ': ' . $cod_bara['error'];
                        }
                    } else {
                        if (!empty($cod_bara[0]['BarCode'])) {
                            $barcode = $cod_bara[0]['BarCode'];
                            $returnCode = $cod_bara[0]['ReturnCode'];
                            $returnAwb = $cod_bara[0]['ReturnAwb'];

                            if ($this->db->query(
                                "UPDATE `" . DB_PREFIX . "awb_cargus` SET barcode = '" . $barcode . "', ReturnAwb='" . $returnAwb .
                                "', ReturnCode='" . $returnCode . "' WHERE id = '" . addslashes(
                                    $id
                                ) . "'"
                            )) {
                                $successes[] = $cod_bara;
                            } else {
                                $this->log->write('Create AWB error, data:' . print_r($fields, true));
                                $this->log->write('Error update awb, data: ' . print_r($cod_bara, true));
                                $errors[] = 'Unknown update awb error!';
                            }
                        } else {
                            $this->log->write('Create AWB error, data:' . print_r($fields, true));
                            $this->log->write('Return awb api call, data: ' . print_r($cod_bara, true));
                            $errors[] = 'Unknown error!';
                        }
                    }
                }
            }
        }

        if (count($errors) > 0) {
            $this->session->data['error'] = implode('; ', $errors);
        }

        if (count($successes) > 0) {
            $c = count($successes);
            $this->session->data['success'] = ($c == 1
                ? $this->language->get('text_one') . ' ' . $this->language->get(
                    'text_success_validated_1'
                )
                : $c . ' ' . $this->language->get('text_success_validated'));
        }

        if (!empty($errors)) {
            return false;
        }

        return true;
    }
}