<?php

/**
 * This class is caching json data
 *
 * Get json from API and save it locally
 *
 */
class ModelExtensionShippingCargusCache extends Model
{
    const FILE_THRESHOLD_SECONDS = 24*3600; // If file wasn't modified for > 24h (24*3600s)

    const CACHE_DIR = DIR_CACHE . 'cargus/';

    public function __construct($registry)
    {
        parent::__construct($registry);

        clearstatcache();
        //check if cache dir is usable
        //create dir
        if (!is_dir(self::CACHE_DIR) &&
            !mkdir(self::CACHE_DIR, 0775)
        ) {
            $msg = __CLASS__.'::'.__FUNCTION__.' Unable to create cache dir: ' . self::CACHE_DIR;
            $this->log->write($msg);
            error_log($msg);
        }

        if (!is_writable(self::CACHE_DIR)) {
            $msg = __CLASS__.'::'.__FUNCTION__.' Unable to write in cache dir: ' . self::CACHE_DIR;
            $this->log->write($msg);
            error_log($msg);
        }
    }

    public function getCacheFile($filename, $alsoExpired = false)
    {
        clearstatcache();

        $file = self::CACHE_DIR . $filename;

        //check if file is present in cache dir
        if (!file_exists($file)) {
            return false;
        }

        //check if expired or updating
        $elapsed = time() - filemtime($file);
        if ($elapsed >= self::FILE_THRESHOLD_SECONDS && !$alsoExpired) {
            return false;
        }

        //get data
        $data = file_get_contents($file);

        if ($data === false) {
            $msg = __CLASS__.'::'.__FUNCTION__. " Error reading file: $file";
            error_log($msg);
            $this->log->write($msg);

            return false;
        }

        if (strlen($data) <= 2) {
            $msg = __CLASS__.'::'.__FUNCTION__. " File was empty: $file, data=$data";
            error_log($msg);
            $this->log->write($msg);

            //try to remove file
            if (!unlink($file)) {
                $msg = __CLASS__.'::'.__FUNCTION__. " Unable to delete file: $file";
                error_log($msg);
                $this->log->write($msg);
            }
            return false;
        }

        return $data;
    }

    public function writeCacheFile($filename, $json)
    {
        clearstatcache();

        $file = self::CACHE_DIR . $filename;

        // Write file
        $fp = @fopen($file, 'w');

        if ($fp === false) {
            $msg = __CLASS__.'::'.__FUNCTION__. " Unable to write file: $file";
            error_log($msg);
            $this->log->write($msg);

            return false;
        }

        $status = true;

        if (fwrite($fp, $json) === false) {
            $msg = __CLASS__.'::'.__FUNCTION__. " Writing to file $file failed, data=$json";
            error_log($msg);
            $this->log->write($msg);

            $status = false;
        }

        fclose($fp);

        return $status;
    }


    /**
     * @param $city id
     *
     * @return string json data
     */
    public function getStreets($city = null)
    {
        if (is_null($city)) {
            return '[]';
        }

        //get file from cache
        $json = $this->getCacheFile('str'.$city);

        if ($json === false) {
            //file not found in cache

            //get fresh data
            $this->load->model('extension/shipping/cargusclass');

            $data = $this->model_extension_shipping_cargusclass->getStreets($city);

            $json = json_encode($data);

            //save data to cache
            $this->writeCacheFile('str'.$city, $json);
        }

        //return json data
        return $json;
    }

    public function getCounties()
    {
        //get file from cache
        $json = $this->getCacheFile('counties');

        if ($json === false) {
            //file not found in cache

            //get fresh data
            $this->load->model('extension/shipping/cargusclass');

            $data = $this->model_extension_shipping_cargusclass->getCounties();

            $json = json_encode($data);

            //save data to cache
            $this->writeCacheFile('counties', $json);
        }

        //return data
        return json_decode($json, true);
    }

    public function getLocalities($countyId = null)
    {
        if (is_null($countyId)) {
            return array();
        }

        //get file from cache
        $json = $this->getCacheFile('localities'.$countyId);

        if ($json === false) {
            //file not found in cache

            //get fresh data
            $this->load->model('extension/shipping/cargusclass');

            $data = $this->model_extension_shipping_cargusclass->getLocalities($countyId);

            $json = json_encode($data);

            //save data to cache
            $this->writeCacheFile('localities'.$countyId, $json);
        }

        //return json data
        return $json;
    }

    public function getPudoPoints()
    {
        //get file from cache
        $json = $this->getCacheFile('pudopoints');

        if ($json === false) {
            //file not found in cache

            //get fresh data
            $this->load->model('extension/shipping/cargusclass');

            $data = $this->model_extension_shipping_cargusclass->getPudoPoints();

            $json = json_encode($data);

            //save data to cache
            $this->writeCacheFile('pudopoints', $json);
        }

        //return json data
        return $json;
    }
}
