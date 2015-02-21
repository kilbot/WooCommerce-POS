<?php

/**
* Loads the POS Payment Gateways
*
* @class    WC_POS_Gateways
* @package  WooCommerce POS
* @author   Paul Kilmurray <paul@kilbot.com.au>
* @link     http://www.woopos.com.au
*/

class WC_POS_Gateways {

  private $settings;
  private $settings_data;
  private $gateway_data;

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'woocommerce_payment_gateways', array( $this, 'payment_gateways' ) );
    add_action( 'woocommerce_pos_payment_gateways', array( $this, 'pos_gateways' ) );
    add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 10, 1 );
    add_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( $this, 'pos_status' ), 10, 1 );
    add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
  }

  /**
   * Add POS gateways
   * @param $gateways
   * @return array
   */
  public function payment_gateways( $gateways ) {
    $pos_gateways = array(
      'WC_POS_Gateways_Cash',
      'WC_POS_Gateways_Card'
    );

    // hide gateways on the woocommerce settings page
    if(is_admin()){
      $screen = get_current_screen();
      if( !empty($screen) && $screen->id == 'woocommerce_page_wc-settings' ) {
        $pos_gateways = array();
      }
    }

    return array_merge($gateways, $pos_gateways);
  }

  /**
   * Enable POS gateways
   * @param $gateway
   */
  public function pos_gateways( $gateway ) {
    if( in_array( $gateway->id, array( 'pos_cash', 'pos_card', 'paypal' ) ) )
      $gateway->pos = true;
  }

  /**
   * Add POS Status column
   *
   * @param  array $columns
   * @return array $new_columns
   */
  public function woocommerce_payment_gateways_setting_columns( $columns ) {
    $new_columns = array();
    foreach ( $columns as $key => $column ) {
      $new_columns[$key] = $column;
      if( $key == 'status' ) {
        $new_columns['status'] = __( 'Online Store', 'woocommerce-pos' );
        $new_columns['pos_status'] = __( 'POS', 'woocommerce-pos' );
      }
    }
    return $new_columns;
  }

  /**
   * POS Status for each gateway
   *
   * @param  object $gateway
   */
  public function pos_status( $gateway ) {

    $enabled_gateways = (array) get_option( 'woocommerce_pos_enabled_gateways' );

    echo '<td class="pos_status">';
    if ( in_array( $gateway->id, $enabled_gateways ) )
      /* translators: woocommerce */
      echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
    else
      echo '-';
    echo '</td>';
  }

  /**
   * CSS
   */
  public function enqueue_admin_styles() {
    $screen = get_current_screen();

    if ( $screen->id == 'woocommerce_page_wc-settings' ) {
      $css = '
        table.wc_gateways .pos_status, table.wc_gateways .pos_enabled { text-align: center; }
        table.wc_gateways .pos_status .tips, table.wc_gateways .pos_enabled .tips { margin: 0 auto; }
        .status-disabled:before { font-family:WooCommerce; speak:none; font-weight:400; font-variant:normal; text-transform:none; line-height:1; -webkit-font-smoothing:antialiased; margin:0; text-indent:0; position:absolute; top:0;left:0; width:100%; height:100%; text-align:center; content: "\e602"; color:#E0E0E0; }
      ';
      wp_add_inline_style( 'wp-admin', $css );
    }

  }

  /**
   * @return array
   */
  public function enabled_gateways(){
    $this->settings      = new WC_POS_Admin_Settings_Checkout();
    $this->settings_data = $this->settings->get_data();

    $_gateways  = array();
    $data       = $this->settings_data;
    $enabled    = isset($data['enabled']) ? $data['enabled'] : '';
    $default    = isset($data['default_gateway']) ? $data['default_gateway'] : '';
    $gateways   = WC()->payment_gateways->payment_gateways();

    if($enabled):
      foreach(array_keys(array_filter($enabled)) as $gateway):
        if(array_key_exists($gateway, $gateways)){
          $_gateways[$gateway] = $this->sanitize( $gateways[$gateway] );
          $_gateways[$gateway]->default = $gateway == $default;
        }
      endforeach;
    endif;

    return $this->order($_gateways);
  }

  /**
   * @param array $gateways
   * @return array
   */
  private function order(array $gateways){
    if(isset($this->settings_data['gateway_order'])){
      $order = $this->settings_data['gateway_order'];
      $commonKeysInOrder = array_intersect_key($order, $gateways);
      $commonKeysWithValue = array_intersect_key($gateways, $commonKeysInOrder);
      $gateways = array_merge($commonKeysInOrder, $commonKeysWithValue);
    }
    return $gateways;
  }

  /**
   * @param WC_Payment_Gateway $gateway
   * @return WC_Payment_Gateway
   */
  private function sanitize(WC_Payment_Gateway $gateway){
    $this->gateway_data = $this->settings->get_gateway_data($gateway->id);

    $gateway->title           = $this->get_title($gateway);
    $gateway->description     = $this->get_description($gateway);
    $gateway->icon            = $this->get_icon($gateway);
    $gateway->payment_fields  = $this->payment_fields($gateway);

    return $gateway;
  }

  /**
   * @param WC_Payment_Gateway $gateway
   * @return string
   */
  private function get_title(WC_Payment_Gateway $gateway){
    return isset($this->gateway_data['title']) ? $this->gateway_data['title']: $gateway->get_title();
  }

  /**
   * @param WC_Payment_Gateway $gateway
   * @return string
   */
  private function get_description(WC_Payment_Gateway $gateway){
    return isset($this->gateway_data['description']) ? $this->gateway_data['description']: '';
  }

  /**
   * @param WC_Payment_Gateway $gateway
   * @return string
   */
  private function get_icon(WC_Payment_Gateway $gateway){
    $icon = '';

    if(isset($this->gateway_data['icon']) && $this->gateway_data['icon'] == true){
      $icon = $gateway->get_icon();
      if($icon !== ''){
        // simple preg_match
        preg_match('/< *img[^>]*src *= *["\']?([^"\']*)/i', $icon, $src);
        $icon = $src[1];
      }
    }

    return $icon;
  }

  /**
   * @param WC_Payment_Gateway $gateway
   * @return mixed|string
   */
  private function payment_fields(WC_Payment_Gateway $gateway){
    $html = '';
    if( $gateway->has_fields() || $gateway->get_description() ){

      ob_start();
      $gateway->payment_fields();
      $html = ob_get_contents();
      ob_end_clean();

      // remove any javascript
      // note: DOMDocument causes more problems than it's worth

//      $doc = new DOMDocument();
//      $doc->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
//      $script_tags = $doc->getElementsByTagName('script');
//      $length = $script_tags->length;
//      for ($i = 0; $i < $length; $i++) {
//        $script_tags->item($i)->parentNode->removeChild($script_tags->item($i));
//      }
//      echo $doc->saveHTML();

      // simple preg_replace
      $html = preg_replace('/<script.+?<\/script>/im', '', $html);
    }
    return $html;
  }

}