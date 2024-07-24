<?php

class ModelExtensionShippingCargus extends Model
{
    /**
     * @param int $orderId
     *
     * @return array
     */
    public function getAwbForOrderId($orderId)
    {
        $query = "SELECT * FROM `" . DB_PREFIX . "awb_cargus` WHERE order_id={$this->db->escape($orderId)}";

        return $this->db->query($query)->row;
    }
}
