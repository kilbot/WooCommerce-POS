<?php

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that its ready for translation.
 *
 * @class     WC_POS_i18n
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_i18n {

  private $github_url;

  /**
   * Constructor
   */
  public function __construct() {

    // raw github url for language packs
    $this->github_url = 'https://raw.githubusercontent.com/kilbot/WooCommerce-POS-Language-Packs/master/';

//    add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
    $this->load_plugin_textdomain();
    add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'update_check' ) );
    add_filter( 'upgrader_pre_download', array( $this, 'upgrader_pre_download' ), 10, 3 );
  }

  /**
   * Load the plugin text domain for translation.
   */
  public function load_plugin_textdomain() {

    $locale = apply_filters( 'plugin_locale', get_locale(), 'woocommerce-pos' );
    $dir    = trailingslashit( WP_LANG_DIR );

    load_textdomain( 'woocommerce-pos', $dir . 'woocommerce-pos/woocommerce-pos-' . $locale . '.mo' );
    load_textdomain( 'woocommerce-pos', $dir . 'plugins/woocommerce-pos-' . $locale . '.mo' );

    // admin translations
    if( is_admin() ) {
      load_textdomain( 'woocommerce-pos', $dir . 'woocommerce-pos/woocommerce-pos-admin-' . $locale . '.mo' );
      load_textdomain( 'woocommerce-pos', $dir . 'plugins/woocommerce-pos-admin-' . $locale . '.mo' );
    } else {
      load_textdomain( 'woocommerce', $dir . 'woocommerce/woocommerce-admin-' . $locale . '.mo' );
      load_textdomain( 'woocommerce', $dir . 'plugins/woocommerce-admin-' . $locale . '.mo' );
    }

  }

  /**
   * Check GitHub repo for updated language packs
   *
   * @param $transient
   *
   * @return mixed
   */
  public function update_check( $transient, $force = false ) {
    $locale = get_locale();

    // pre_set_site_transient_update_plugins is called twice
    // we only want to act on the second run
    // also only continue for non English locales
    if ( empty( $transient->checked ) || strpos( $locale, 'en_' ) === 0 ) {
      return $transient;
    }

    // get package.json from github
    $request = wp_remote_get(
      $this->github_url . 'package.json',
      array( 'timeout' => 45 )
    );

    if ( is_wp_error( $request ) || wp_remote_retrieve_response_code( $request ) != 200 ) {
      return $transient;
    }

    // see if translation pack exists
    $response = json_decode(wp_remote_retrieve_body( $request ) );
    $transient = apply_filters( 'woocommerce_pos_language_packs_upgrade', $transient, $response, $this->github_url );
    if( ! isset( $response->locales->$locale ) ) {
      return $transient;
    }

    // compare
    $new = strtotime( $response->locales->$locale );
    $options = get_option( 'woocommerce_pos_language_packs' );

    if( isset( $options[$locale] ) && $options[$locale] >= $new && !$force ){
      return $transient;
    }

    // update required
    $transient->translations[] = array(
      'type'       => 'plugin',
      'slug'       => 'woocommerce-pos',
      'language'   => $locale,
      'version'    => WC_POS_VERSION,
      'updated'    => date( 'Y-m-d H:i:s', $new ),
      'package'    => $this->github_url . 'packages/woocommerce-pos-' . $locale . '.zip',
      'autoupdate' => 1
    );

    return $transient;

  }

  /**
   * Update the database with new language pack date
   * TODO: is there no later hook for translation install?
   *
   * @param $reply
   * @param $package
   * @param $upgrader
   *
   * @return mixed
   */
  public function upgrader_pre_download( $reply, $package, $upgrader ) {

    if( isset( $upgrader->skin->language_update )
      && $upgrader->skin->language_update->slug == 'woocommerce-pos' ) {

      $options = get_option( 'woocommerce_pos_language_packs', array() );
      $locale = get_locale();
      $options[$locale] = current_time('timestamp');
      if ( ! add_option( 'woocommerce_pos_language_packs', $options, '', 'no' ) ) {
        update_option( 'woocommerce_pos_language_packs', $options );
      }
    }

    return $reply;
  }

  /**
   * Force update translations from AJAX
   */
  public function update_translations(){
    // security
    check_ajax_referer( WC_POS_PLUGIN_NAME, 'security' );

    header("Content-Type: text/event-stream");
    header("Cache-Control: no-cache");
    header("Access-Control-Allow-Origin: *");

    echo ":" . str_repeat(" ", 2048) . PHP_EOL; // 2 kB padding for IE

    $this->manual_update();

    die();
  }

  /**
   * Force update translations
   */
  public function manual_update() {
    ob_start();
    $locale = get_locale();
    $creds = request_filesystem_credentials( $_GET['security'], '', false, false, null );

    /* translators: wordpress */
    $this->flush( sprintf( __( 'Updating translations for %1$s (%2$s)&#8230;' ), 'WooCommerce POS', $locale ) );

    $transient = (object) array( 'checked' => true );
    $update = $this->update_check( $transient, true );

    if( empty( $update->translations ) ) {
      /* note: no translation exists */
      $this->flush( 'No translations found for '. $locale .'. <a href="mailto:support@woopos.com.au">Contact us</a> if you would like to help translate WooCommerce POS into your language.' );
      $this->flush('complete');
      return;
    }

    if ( ! $creds || ! WP_Filesystem( $creds ) ) {
      /* translators: wordpress */
      $this->flush( __( 'Translation update failed.' ) );
      $this->flush('complete');
      return;
    }

    foreach( $update->translations as $translation ){

      /* translators: wordpress */
      $this->flush( sprintf( __( 'Downloading translation from <span class="code">%s</span>&#8230;' ), $translation['package'] ) );

      $response = wp_remote_get(
        $translation['package'],
        array( 'sslverify' => false, 'timeout' => 60, 'filename' => $locale . '.zip' )
      );

      if( is_wp_error( $response ) || ( $response['response']['code'] < 200 || $response['response']['code'] >= 300 ) ) {
        /* translators: wordpress */
        $this->flush( __( 'Translation update failed.' ) );
        continue;
      }

      global $wp_filesystem;

      $upload_dir = wp_upload_dir();
      $file = trailingslashit( $upload_dir['path'] ) . $locale . '.zip';

      // Save the zip file
      if ( !$wp_filesystem->put_contents( $file, $response['body'], FS_CHMOD_FILE ) ) {
        /* translators: wordpress */
        $this->flush( __( 'Translation update failed.' ) );
        continue;
      }

      // Unzip the file to wp-content/languages/plugins directory
      $dir = trailingslashit( WP_LANG_DIR ) . 'plugins/';
      $unzip = unzip_file( $file, $dir );
      if ( true !== $unzip ) {
        /* translators: wordpress */
        $this->flush( __( 'Translation update failed.' ) );
        continue;
      }

      // Delete the package file
      $wp_filesystem->delete( $file );

      // Update options timestamp
      $key = str_replace( '-', '_', $translation['slug'] ) . '_language_packs';
      $options = get_option( $key, array() );
      $options[$locale] = current_time('timestamp');
      if ( ! add_option( $key, $options, '', 'no' ) ) {
        update_option( $key, $options );
      }

      /* translators: wordpress */
      $this->flush( __( 'Translation updated successfully.' ) );

    }

    $this->flush('complete');

    return;

  }

  /**
   * Flush output
   *
   * @param $data
   */
  private function flush( $data ) {
    echo 'data:'. $data . PHP_EOL;
    echo PHP_EOL;
    ob_flush();
    flush();
  }

  /**
   * Load translations for js plugins
   *
   * @return string
   */
  public static function locale_js() {
    $locale = apply_filters( 'plugin_locale', get_locale(), WC_POS_PLUGIN_NAME );
    list( $country ) = explode( '_', $locale );

    if( is_readable( WC_POS_PLUGIN_PATH . 'languages/js/' . $locale . '.js' ) )
      return WC_POS_PLUGIN_URL . 'languages/js/' . $locale . '.js';

    if( is_readable( WC_POS_PLUGIN_PATH . 'languages/js/' . $country . '.js' ) )
      return WC_POS_PLUGIN_URL . 'languages/js/' . $country . '.js';

    return false;
  }

  /**
   * Return currency denomination for a given country code
   *
   * @param string $code
   *
   * @return array
   */
  public static function currency_denominations( $code = '' ) {
    $denominations = json_decode( file_get_contents( WC_POS_PLUGIN_PATH. 'includes/denominations.json' ) );
    return $code ? $denominations->$code : $denominations;
  }

  public static function translations($dest = 'frontend'){
    $translations = array();

    $translations['titles'] = array(
      'browser'   => _x( 'Browser', 'system status: browser capabilities', 'woocommerce-pos' ),
      'cart'      => /* translators: woocommerce */ __( 'Cart', 'woocommerce' ),
      'checkout'  => /* translators: woocommerce */ __( 'Checkout', 'woocommerce' ),
      'coupons'   => /* translators: woocommerce */ __( 'Coupons', 'woocommerce' ),
      'customers' => /* translators: woocommerce */ __( 'Customers', 'woocommerce' ),
      'fee'       => /* translators: woocommerce */ __( 'Fee Name', 'woocommerce' ),
      'hotkeys'   => _x( 'HotKeys', 'keyboard shortcuts', 'woocommerce-pos' ),
      'order'     => /* translators: woocommerce */ __( 'Order', 'woocommerce' ),
      'orders'    => /* translators: woocommerce */ __( 'Orders', 'woocommerce' ),
      'products'  => /* translators: woocommerce */ __( 'Products', 'woocommerce' ),
      'receipt'   => /* translators: woocommerce */ __( 'Receipt', 'woocommerce' ),
      'shipping'  => /* translators: woocommerce */ __( 'Shipping Name', 'woocommerce' ),
      'to-pay'    => __( 'To Pay', 'woocommerce-pos' ),
    );

    $translations['buttons'] = array(
      'checkout'  => /* translators: woocommerce */ __( 'Checkout', 'woocommerce' ),
      'clear'     => _x( 'Clear', 'system status: delete local records', 'woocommerce-pos' ),
      'close'     => /* translators: wordpress   */ __( 'Close' ),
      'coupon'    => /* translators: woocommerce */ __( 'Coupon', 'woocommerce' ),
      'discount'  => __( 'Discount', 'woocommerce-pos' ),
      'email'     => /* translators: wordpress   */ __( 'Email' ),
      'fee'       => /* translators: woocommerce */ __( 'Fee', 'woocommerce' ),
      'new-order' => /* translators: woocommerce */ __( 'New Order', 'woocommerce' ),
      'note'      => /* translators: woocommerce */ __( 'Note', 'woocommerce' ),
      'print'     => /* translators: wordpress   */ __( 'Print' ),
      'process-payment' => __( 'Process Payment', 'woocommerce-pos' ),
      'refresh'   => /* translators: wordpress   */ __( 'Refresh' ),
      'restore'   => _x( 'Restore defaults', 'restore default settings', 'woocommerce-pos' ),
      'return'    => _x( 'return', 'Numpad return key', 'woocommerce-pos' ),
      'return-to-sale'  => __( 'Return to Sale', 'woocommerce-pos' ),
      'save'      => /* translators: woocommerce */ __( 'Save Changes', 'woocommerce' ),
      'send'      => /* translators: wordpress   */ __( 'Submit' ),
      'shipping'  => /* translators: woocommerce */ __( 'Shipping', 'woocommerce' ),
      'void'      => __( 'Void', 'woocommerce-pos' ),
    );

    $translations['messages'] = array(
      'choose'    => /* translators: woocommerce */ __( 'Choose an option', 'woocommerce' ),
      'error'     => /* translators: woocommerce */ __( 'Sorry, there has been an error.', 'woocommerce' ),
      'loading'   => __( 'Loading&hellip;' ),
      'success'   => /* translators: woocommerce */ __( 'Your changes have been saved.', 'woocommerce' ),
      'browser'   => __( 'Your browser is not supported!', 'woocommerce-pos' ),
    );

    $translations['plural'] = array(
      'records'   => _x( 'record |||| records', 'eg: 23 records', 'woocommerce-pos' ),
    );

    return $translations;
  }

}