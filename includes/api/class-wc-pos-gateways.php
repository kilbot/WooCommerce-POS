<?php

/**
 * POS Gateways
 *
 * @class    WC_POS_API_Gateways
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly
}

class WC_POS_API_Gateways extends WC_API_Resource {

  protected $base = '/pos/gateways';

  /**
   * Register routes for POS Params
   *
   * GET /pos
   *
   * @param array $routes
   * @return array
   */
  public function register_routes( array $routes ) {

    # GET /pos/params
    $routes[ $this->base ] = array(
      array( array( $this, 'get_gateways' ), WC_API_Server::READABLE )
    );

    return $routes;

  }

  /**
   * @param null $wc_pos_admin
   * @return array
   */
  public function get_gateways( $wc_pos_admin = null ){
    if( $wc_pos_admin ){
      return;
    }

    $settings = WC_POS_Admin_Settings_Checkout::get_instance();
    $gateways = $settings->load_enabled_gateways();
    $payload = array();

    if ( $gateways ): foreach ( $gateways as $gateway ):
      $payload[] = array(
        'method_id'       => $gateway->id,
        'method_title'    => esc_html( $gateway->get_title() ),
        'icon'            => $this->sanitize_icon( $gateway ),
        'active'          => $gateway->default,
        'payment_fields'  => $this->sanitize_payment_fields( $gateway )
      );
    endforeach; endif;

    return $payload;
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

    return wc_pos_trim_html_string( $html );
  }

  /**
   * Removes dom nodes, eg: <script> elements
   *
   * @param $html
   * @param $xpathString
   * @return string
   */
  private function removeDomNodes( $html, $xpathString ) {
    if( ! class_exists('DOMDocument') ){
      return preg_replace('/<script.+?<\/script>/im', '', $html);
    }

    $dom = new DOMDocument();

    // Libxml constants not available on all servers (Libxml < 2.7.8)
    // $html->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $dom->loadHtml( '<?xml encoding="UTF-8">' . '<div class="form-group">' . $html . '</div>' );
    # remove <!DOCTYPE
    $dom->removeChild( $dom->doctype );
    # remove <?xml encoding="UTF-8">
    $dom->removeChild( $dom->firstChild );
    # <html><body></body></html>
    $dom->replaceChild( $dom->firstChild->firstChild->firstChild, $dom->firstChild );

    // remove the required node
    $xpath = new DOMXPath( $dom );
    while ( $node = $xpath->query( $xpathString )->item( 0 ) ) {
      $node->parentNode->removeChild( $node );
    }

    return $dom->saveHTML();
  }

}