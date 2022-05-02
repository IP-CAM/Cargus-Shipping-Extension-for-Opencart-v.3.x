<?php
class ControllerExtensionModuleCargusShip extends Controller
{

    const FILE_THRESHOLD_SECONDS = 1800; // If file wasn't modified for > 1h (3600s)

    const FILE_TEMP_THRESHOLD_SECONDS = 80;

    const LOCATION_FILE_NAME_TMP = DIR_APPLICATION . '/view/locations/pudo_locations_tmp.json';

    const LOCATION_FILE_NAME = DIR_APPLICATION . '/view/locations/pudo_locations.json';
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
            file_put_contents(self::LOCATION_FILE_NAME_TMP, "", FILE_APPEND);
            $isUpdating = true;

            require_once(DIR_APPLICATION . 'model/extension/shipping/cargusclass.php');
            $cargus = new ModelExtensionShippingCargusClass();

            $cargus->SetKeys($this->config->get('cargus_api_url'), $this->config->get('cargus_api_key'));

            // UC login user
            $fields = array(
                'UserName' => $this->config->get('cargus_username'),
                'Password' => $this->config->get('cargus_password')
            );
            $token = $cargus->CallMethod('LoginUser', $fields, 'POST');
            $locations = $cargus->CallMethod('PudoPoints', array(), 'GET', $token);

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
        rename(self::LOCATION_FILE_NAME_TMP, self::LOCATION_FILE_NAME);
        $this->message['message'] = "File was updated"; /*  */
    }

    public function showResponse()
    {
        echo json_encode($this->message);
        return true;
    }
}
