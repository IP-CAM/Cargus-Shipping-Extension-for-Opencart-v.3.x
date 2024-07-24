<?php
/**
 * cargus short summary.
 *
 * cargus description.
 *
 * @version 1.1
 * @author Catalin Pantazi
 */
class ModelExtensionShippingCargusClass extends Model
{
    const CURL_TIMEOUT = 60; // increase timeput for curl for pudo location

    public function __construct($registry)
    {
        parent::__construct($registry);

        $this->cargusapicurl = curl_init();
        curl_setopt($this->cargusapicurl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->cargusapicurl, CURLOPT_CONNECTTIMEOUT, self::CURL_TIMEOUT);
        curl_setopt($this->cargusapicurl, CURLOPT_TIMEOUT, self::CURL_TIMEOUT);
        curl_setopt($this->cargusapicurl, CURLOPT_SSL_VERIFYPEER, false);
    }

    public function SetKeys($url, $key)
    {
//        error_log(__CLASS__.'::'.__FUNCTION__." url=$url,key=$key");
        $this->cargusapiurl = $url;
        $this->cargusapikey = $key;
    }

    public function CallMethod($function, $parameters = '', $verb, $token = null)
    {
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        $json = json_encode($parameters);

        //$this->log->write('API Call ' . $function);

//        error_log(__CLASS__.'::'.__FUNCTION__." url=$this->cargusapiurl,function=$function");

        curl_setopt($this->cargusapicurl, CURLOPT_POSTFIELDS, $json);
        curl_setopt($this->cargusapicurl, CURLOPT_CUSTOMREQUEST, $verb);
        curl_setopt($this->cargusapicurl, CURLOPT_URL, $this->cargusapiurl . '/' . $function);

        if ($function == 'LoginUser') {
            $headers = array (
                'Ocp-Apim-Subscription-Key: '.$this->cargusapikey,
                'Ocp-Apim-Trace: true',
                'Content-Type: application/json',
                'ContentLength: '.strlen($json)
            );
        } else {
            $headers = array (
                'Ocp-Apim-Subscription-Key: '.$this->cargusapikey,
                'Ocp-Apim-Trace: true',
                'Authorization: Bearer '.($token == 'useException' ? $this->cargusapitoken : $token),
                'Content-Type: application/json',
                'Content-Length: '.strlen($json)
            );
            if ($function == 'Awbs' && $verb == 'POST') {
                $headers[] = 'path: OC'.substr(str_replace('.', '', VERSION), 0, 3);
            }
        }

        curl_setopt(
            $this->cargusapicurl,
            CURLOPT_HTTPHEADER,
            $headers
        );


        $result = curl_exec($this->cargusapicurl);
        $header = curl_getinfo($this->cargusapicurl);

        $data = json_decode($result, true);
        $status = $header['http_code'];
        if ($status == '200') {
            if (is_array($data) && isset($data['message'])) {
                return $data['message'];
            } else {
                return $data;
            }
        } elseif ($status == '204') {
            return null;
        } else {
            if ($token == 'useException') {
                throw new \Exception(
                    is_array($data) ? print_r($data, true) : $data,
                    $status
                );
            }
            $message = print_r(array(
                'url' => $this->cargusapiurl,
                'key' => $this->cargusapikey,
                'status' => $status,
                'method' => $function,
                'verb' => $verb,
                'token' => $token,
                'params' => $parameters,
                'data' => $data
            ), true) ."\n\n";
            $message .= 'CURL Error=' . print_r(curl_error($this->cargusapicurl), true) ."\n\n";
            $message .= 'CURL Result=' . print_r($result, true) ."\n\n";
            $message .= 'trace=' . print_r(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS), true). "\n\n";

            error_log($message);
            $this->log->write($message);

            if (isset($data) && is_array($data) && !empty($data)) {
                return array('error' => implode(', ', $data));
            }
            if (isset($data)) {
                return array('error' => $data);
            }

            return false;
            /*@ob_end_clean();
            echo '<pre>';
            echo 'Status<br/>';
            print_r(array(
                'url' => $this->cargusapiurl,
                'key' => $this->cargusapikey,
                'status' => $status,
                'method' => $function,
                'verb' => $verb,
                'token' => $token,
                'params' => $parameters,
                'data' => $data
            ));
            echo 'CURL Error<br/>';
            echo print_r(curl_error($this->cargusapicurl), true);
            echo 'CURL Result<br>';
            echo print_r($result, true);
            echo '</pre>';
            die();*/
        }
    }

    public function login()
    {
        //set vars if needed
        if (is_null($this->cargusapikey) || is_null($this->cargusapiurl)) {
            $this->SetKeys(
                $this->config->get('shipping_cargus_api_url'),
                $this->config->get('shipping_cargus_api_key')
            );
        }

        if (!is_null($this->cargusapitoken)) {
            return $this->cargusapitoken;
        }

        // login user
        $fields = array(
            'UserName' => $this->config->get('shipping_cargus_username'),
            'Password' => $this->config->get('shipping_cargus_password')
        );

        try {
            $token = $this->CallMethod('LoginUser', $fields, 'POST', 'useException');
            $this->cargusapitoken = $token;
            return $token;
        } catch (\Exception $e) {
            //login error
            $message = __CLASS__.':'.__FUNCTION__.' error: ' . $e->getMessage();

            error_log($message);
            $this->log->write($message);
        }

        return null;
    }

    public function getStreets($localityId)
    {
        //get streets
        if (is_null($localityId)) {
            return array();
        }

        //login
        $this->login();

        $json = array();

        //get api json
        //Streets?localityId=97243
        try {
            error_log(__CLASS__.':'.__FUNCTION__.' get live');
            $json = $this->CallMethod('Streets?localityId='.$localityId, array(), 'GET', 'useException');
        } catch (\Exception $e) {
            $message = __CLASS__.'::'.__FUNCTION__.' localityId='.$localityId.', error: ' . $e->getMessage();

            error_log($message);
            $this->log->write($message);

            //get old cache if exists
            $this->load->model('extension/shipping/cargus_cache');

            $temp = $this->model_extension_shipping_cargus_cache->getCacheFile('str'.$localityId, true);

            if ($temp !== false) {
                //return the old data
                $json = json_decode($temp, true);
            }
        }

        return $json;
    }

    public function getCounties()
    {
        //login
        $this->login();

        $json = array();

        //get api json
        //Counties?countryId=1
        try {
            error_log(__CLASS__.':'.__FUNCTION__.' get live');
            $json = $this->CallMethod('Counties?countryId=1', array(), 'GET', 'useException');
        } catch (\Exception $e) {
            $message = __CLASS__.'::'.__FUNCTION__.' error: ' . $e->getMessage();

            error_log($message);
            $this->log->write($message);

            //get old cache if exists
            $this->load->model('extension/shipping/cargus_cache');

            $temp = $this->model_extension_shipping_cargus_cache->getCacheFile('counties', true);

            if ($temp !== false) {
                //return the old data
                $json = json_decode($temp, true);
            }
        }

        return $json;
    }

    public function getLocalities($countyId)
    {
        if (is_null($countyId)) {
            return array();
        }

        //login
        $this->login();

        $json = array();

        //get api json
        //Localities?countryId=1&countyId=97243
        try {
            error_log(__CLASS__.':'.__FUNCTION__.' get live');
            $json = $this->CallMethod('Localities?countryId=1&countyId='.$countyId, array(), 'GET', 'useException');
        } catch (\Exception $e) {
            $message = __CLASS__.'::'.__FUNCTION__.' countyId='.$countyId.', error: ' . $e->getMessage();

            error_log($message);
            $this->log->write($message);

            //get old cache if exists
            $this->load->model('extension/shipping/cargus_cache');

            $temp = $this->model_extension_shipping_cargus_cache->getCacheFile('localities'.$countyId, true);

            if ($temp !== false) {
                //return the old data
                $json = json_decode($temp, true);
            }
        }

        return $json;
    }

    public function getPudoPoints()
    {
        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        //login
        $this->login();

        $json = array();

        //get api json
        //PudoPoints
        try {
            error_log(__CLASS__.':'.__FUNCTION__.' get live');
            $json = $this->CallMethod('PudoPoints', array(), 'GET', 'useException');
        } catch (\Exception $e) {
            $message = __CLASS__.'::'.__FUNCTION__.' error: ' . $e->getMessage();

            error_log($message);
            $this->log->write($message);

            //get old cache if exists
            $this->load->model('extension/shipping/cargus_cache');

            $temp = $this->model_extension_shipping_cargus_cache->getCacheFile('pudopoints', true);

            if ($temp !== false) {
                //return the old data
                $json = json_decode($temp, true);
            }
        }

        return $json;
    }
}
