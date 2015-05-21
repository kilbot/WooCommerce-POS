<?php

/**
 * Global helper functions for WooCommerce POS
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 *
 */

/**
 * Construct the POS permalink
 *
 * @param string $page
 *
 * @return string|void
 */
function wc_pos_url( $page = '' ) {
  $option = get_option( WC_POS_Admin_Settings::DB_PREFIX . 'permalink', 'pos' );
  $slug = empty($option) ? 'pos' : $option; // make sure slug not empty

  return home_url( $slug . '/' .$page );
}


/**
 * Test for POS requests to the server
 *
 * @param $type
 *
 * @return bool
 */
function is_pos( $type = false ) {

  // test for template requests, ie: matched rewrite rule
  // also matches $_GET & $_POST for pos=1
  if( $type == 'template' || !$type ){
    global $wp;
    if( isset( $wp->query_vars['pos'] ) && $wp->query_vars['pos'] == 1 ){
      return true;
    }
  }

  // test for WC REST API requests, ie: matched request header
  if( $type == 'ajax' || !$type ) {
    if ( function_exists( 'getallheaders' )
         && is_array( getallheaders() )
         && array_key_exists( 'X-WC-POS', getallheaders() )
    ) {
      return true;
    } elseif ( isset( $_SERVER['HTTP_X_WC_POS'] ) && $_SERVER['HTTP_X_WC_POS'] == 1 ) {
      return true;
    }
  }

  return false;
}

/**
 * Add or update a WordPress option.
 * The option will _not_ auto-load by default.
 *
 * @param string $name
 * @param mixed $value
 * @param string $autoload
 * @return bool
 */
function wc_pos_update_option( $name, $value, $autoload = 'no' ) {
  $success = add_option( $name, $value, '', $autoload );

  if ( ! $success ) {
    $success = update_option( $name, $value );
  }

  return $success;
}

/**
 * Simple wrapper for json_encode
 *
 * Use JSON_FORCE_OBJECT for PHP 5.3 or higher with fallback for
 * PHP less than 5.3.
 *
 * WP 4.1 adds some wp_json_encode sanity checks which may be
 * useful at some later stage.
 *
 * @param $data
 * @return mixed
 */
function wc_pos_json_encode($data){
  if ( version_compare( PHP_VERSION, '5.3', '>=' ) ) {
    $args = array( $data, JSON_FORCE_OBJECT );
  } else {
    $args = array( _wc_pos_array_to_object($data) );
  }

  return call_user_func_array( 'json_encode', $args );
}


/**
 * Recursively cast array to object
 *
 * @param $data
 * @return object
 */
function _wc_pos_array_to_object($data) {
  if (is_array($data)) {
    return (object) array_map(__FUNCTION__, $data);
  } else {
    return $data;
  }
}

/**
 * Return template path
 *
 * @param string $path
 * @return mixed|void
 */
function wc_pos_locate_template($path = ''){
  $template = locate_template(array(
    'woocommerce-pos/' . $path
  ));

  if( !$template ){
    $template = WC_POS_PLUGIN_PATH. 'includes/views/' . $path;
  }

  if ( file_exists( $template ) ) {
    return apply_filters('woocommerce_pos_locate_template', $template, $path);
  }
}