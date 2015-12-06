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

  protected static $instance;

  private $enabled_gateways;

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'woocommerce_payment_gateways', array( $this, 'payment_gateways' ) );
    add_action( 'woocommerce_pos_load_gateway', array( $this, 'load_gateway' ) );
    add_filter( 'woocommerce_pos_templates', array( $this, 'templates' ) );
    add_filter( 'woocommerce_pos_params', array( $this, 'params' ) );

    static::$instance = $this;
  }

  /**
   * Returns the Singleton instance of this class.
   * - late static binding requires PHP 5.3+
   * @return Singleton
   */
  public static function get_instance() {
    $class = get_called_class();
    if (null === static::$instance) {
      static::$instance = new $class();
    }
    return static::$instance;
  }

  /**
   * Add POS gateways
   * @param $gateways
   * @return array
   */
  public function payment_gateways( array $gateways ) {
    // don't show POS gateways on WC settings page
    if( is_admin() && function_exists('get_current_screen') ){
      $screen = get_current_screen();
      if( !empty($screen) && $screen->id == 'woocommerce_page_wc-settings' ) {
        return $gateways;
      }
    }

    return array_merge($gateways, array(
      'WC_POS_Gateways_Cash',
      'WC_POS_Gateways_Card'
    ));
  }

  /**
   * Enable POS gateways
   * @param $gateway
   * @return bool
   */
  public function load_gateway( WC_Payment_Gateway $gateway ) {
    $gateway->pos = in_array( $gateway->id, array( 'pos_cash', 'pos_card', 'paypal' ) );
    return $gateway;
  }

  /**
   *
   */
  public function get_enabled_gateways(){
    if (null === $this->enabled_gateways) {
      $settings = WC_POS_Admin_Settings_Checkout::get_instance();
      $this->enabled_gateways = $settings->load_enabled_gateways();
    }
    return $this->enabled_gateways;
  }

  /**
   * @param array $templates
   * @return array
   */
  public function templates( array $templates ) {
    $gateways = $this->get_enabled_gateways();

    if ( $gateways ): foreach ( $gateways as $gateway ):
      $templates[ 'pos' ][ 'checkout' ][ 'gateways' ][ $gateway->id ] = $this->sanitize_payment_fields( $gateway );
    endforeach; endif;

    return $templates;
  }

  /**
   * @param array $params
   * @return array
   */
  public function params( array $params ){
    $gateways = $this->get_enabled_gateways();

    if ( $gateways ): foreach ( $gateways as $gateway ):
      $params[ 'gateways' ][] = array(
        'method_id'    => $gateway->id,
        'method_title' => esc_html( $gateway->get_title() ),
        'icon'         => $this->sanitize_icon( $gateway ),
        'active'       => $gateway->default
      );
    endforeach; endif;

    return $params;
  }

  /**
   * Sanitize payment icon
   * - some gateways include junk in icon property, eg: paypal link
   *
   * @param WC_Payment_Gateway $gateway
   * @return string
   */
  private function sanitize_icon( WC_Payment_Gateway $gateway ) {
    $icon = $gateway->show_icon ? $gateway->get_icon() : '';
    if ( $icon !== '' ) {
      // simple preg_match
      preg_match( '/< *img[^>]*src *= *["\']?([^"\']*)/i', $icon, $src );
      $icon = $src[ 1 ];
    }

    return $icon;
  }

  /**
   * Sanitize payment fields
   * - some gateways include js in their payment fields
   *
   * @param WC_Payment_Gateway $gateway
   * @return mixed|string
   */
  private function sanitize_payment_fields( WC_Payment_Gateway $gateway ) {
    $html = '';
    if ( $gateway->has_fields() || $gateway->get_description() ) {

      ob_start();
      $gateway->payment_fields();
      $html = ob_get_contents();
      ob_end_clean();

      // remove script tags
      $html = $this->removeDomNodes( $html, '//script' );
    }

    return $this->trim_html_string( $html );;
  }

  /**
   * Removes dom nodes, eg: <script> elements
   *
   * @param $html
   * @param $xpathString
   * @return string
   */
  private function removeDomNodes( $html, $xpathString ) {
    $dom = new DOMDocument;

    // Libxml constants not available on all servers (Libxml < 2.7.8)
    // $html->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $dom->loadHtml( '<div class="form-group">' . $html . '</div>' );
    # remove <!DOCTYPE
    $dom->removeChild( $dom->doctype );
    # remove <html><body></body></html>
    $dom->replaceChild( $dom->firstChild->firstChild->firstChild, $dom->firstChild );

    // remove the required node
    $xpath = new DOMXPath( $dom );
    while ( $node = $xpath->query( $xpathString )->item( 0 ) ) {
      $node->parentNode->removeChild( $node );
    }

    return $dom->saveHTML();
  }

  /**
   * Remove newlines and code spacing
   * todo: this is duplicated in Templates class
   *
   * @param $str
   * @return mixed
   */
  private function trim_html_string( $str ) {
    return preg_replace( '/^\s+|\n|\r|\s+$/m', '', $str );
  }

}