<?php
class ControllerExtensionModuleCargusShip extends Controller
{
    const FILE_THRESHOLD_SECONDS = 6*3600; // If file wasn't modified for > 6h (6*3600s)

    const FILE_TEMP_THRESHOLD_SECONDS = 80;

    const LOCATION_FILE_NAME_TMP = DIR_APPLICATION . '/view/javascript/cargus/locations/pudo_locations_tmp.json';

    const LOCATION_FILE_NAME = DIR_APPLICATION . '/view/javascript/cargus/locations/pudo_locations.json';

    public $message = [
        'error' => false,
        'message' => ''
    ];

    public function cron()
    {
        $isUpdating = false;
        if (file_exists(self::LOCATION_FILE_NAME_TMP) && (time() - filemtime(self::LOCATION_FILE_NAME_TMP) <= 1 * self::FILE_TEMP_THRESHOLD_SECONDS)) {
            // other cron is working on it
            $isUpdating = true;
            $this->message['message'] = "Another update job is running";
            return $this->showResponse();
        }

        if (!file_exists(self::LOCATION_FILE_NAME) || (time() - filemtime(self::LOCATION_FILE_NAME) >= 1 * self::FILE_THRESHOLD_SECONDS && !$isUpdating)) {
            $result = file_put_contents(self::LOCATION_FILE_NAME_TMP, "", FILE_APPEND);
            if ($result === false) {
                $this->message['error'] = true;
                $this->message['message'] = "Can't write to file ".self::LOCATION_FILE_NAME_TMP;
                return $this->showResponse();
            }

            $isUpdating = true;

            $this->load->model('extension/shipping/cargusclass');

            $this->model_extension_shipping_cargusclass->SetKeys($this->config->get('cargus_api_url'), $this->config->get('cargus_api_key'));

            // UC login user
            $fields = array(
                'UserName' => $this->config->get('cargus_username'),
                'Password' => $this->config->get('cargus_password')
            );
            $token = $this->model_extension_shipping_cargusclass->CallMethod('LoginUser', $fields, 'POST');
            $locations = $this->model_extension_shipping_cargusclass->CallMethod('PudoPoints', array(), 'GET', $token);

            if ($locations) {
                $this->computePudoLocationFile($locations);
                $this->moveFiles();
            } else {
                $this->message['message'] = "Issue getting location";
            }
            return $this->showResponse();
        }
        $this->message['message'] = "No need for update";
        return $this->showResponse();
    }

    private function computePudoLocationFile($locations)
    {
        if (!is_writable(self::LOCATION_FILE_NAME_TMP)) {
            $this->message['error'] = true;
            $this->message['message'] = "Can't write to file ".self::LOCATION_FILE_NAME_TMP;
            return false;
        }

        // can be null or false so we won't update pudo json file
        $locationsJson = '[';

        file_put_contents(self::LOCATION_FILE_NAME_TMP, $locationsJson, FILE_APPEND);

        $i = 0;
        $len = count($locations);

        foreach ($locations as $key => $location) {
            $locationsJson = json_encode($location, JSON_UNESCAPED_SLASHES);
            if ($i != $len - 1) {
                $locationsJson .= ",";
            }

            file_put_contents(self::LOCATION_FILE_NAME_TMP, $locationsJson, FILE_APPEND);

            $i++;
        }

        $locationsJson = ']';
        file_put_contents(self::LOCATION_FILE_NAME_TMP, $locationsJson, FILE_APPEND);
    }

    private function moveFiles(){
        if (file_exists(self::LOCATION_FILE_NAME)) {
            unlink(self::LOCATION_FILE_NAME);
        }
        if (rename(self::LOCATION_FILE_NAME_TMP, self::LOCATION_FILE_NAME)) {
            $this->message['message'] = "File was updated"; /*  */
        } else {
            $this->message['message'] = "Error updating file";
            $this->message['error'] = true;
        }
    }

    public function showResponse()
    {
        echo json_encode($this->message);
        return true;
    }

    public function location()
    {
        $json = array();

        // Validate if shipping is required. If not the customer should not have reached this page.
        if (!$this->cart->hasShipping()) {
            $json['redirect'] = $this->url->link('checkout/checkout', '', true);
        }

        // Validate if shipping address has been set.
        if (!isset($this->session->data['shipping_address'])) {
            $json['redirect'] = $this->url->link('checkout/checkout', '', true);
        }

        // Validate cart has products and has stock.
        if ((!$this->cart->hasProducts() && empty($this->session->data['vouchers'])) || (!$this->cart->hasStock() && !$this->config->get('config_stock_checkout'))) {
            $json['redirect'] = $this->url->link('checkout/cart');
        }

        if (!$json) {
            $pudo_location_id = $this->request->post['location_id'];

            if (!isset($this->session->data['shipping_address']['custom_field']['pudo_location_id'])) {
                $this->session->data['shipping_address']['custom_field'] = array(
                    'pudo_location_id' => $pudo_location_id
                );
            } else {
                $this->session->data['shipping_address']['custom_field']['pudo_location_id'] = $pudo_location_id;
            }

            //journal3
            $this->session->data['custom_field']['pudo_location_id'] = $pudo_location_id;


            $json['responseText'] = 'ok';
        }

        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode($json));
    }

    public function getPudoPoints()
    {
        $this->load->model('extension/shipping/cargus_cache');

        //PudoPoints
        $json = $this->model_extension_shipping_cargus_cache->getPudoPoints();

        $this->response->addHeader('Content-Type: application/json');

        //data is already json
        $this->response->setOutput($json);
    }
}
