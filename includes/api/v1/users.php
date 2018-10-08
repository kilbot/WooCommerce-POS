<?php

/**
 * POS App parameters
 *
 * @class
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WC_POS\API\v1;

use WC_REST_Controller;
use WP_REST_Server;
use WP_Error;

class Users extends WC_REST_Controller
{
  protected $namespace = 'wcpos/v1';
  protected $rest_base = 'users';

  public function register_routes() {
    register_rest_route(
      $this->namespace, '/' . $this->rest_base, array(
        array(
          'methods'             => WP_REST_Server::READABLE,
          'callback'            => array( $this, 'get_items' ),
          'permission_callback' => array( $this, 'get_items_permissions_check' ),
        ),
        array(
          'methods'             => WP_REST_Server::EDITABLE,
          'callback'            => array( $this, 'update_item' ),
          'permission_callback' => array( $this, 'update_item_permissions_check' ),
          'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
        ),
        'schema' => array( $this, 'get_public_item_schema' )
      )
    );
  }


  /**
   * @param \WP_REST_Request $request
   * @return mixed|WP_Error|\WP_REST_Response
   */
  public function get_items( $request ) {
    $current_user = get_userdata(1);

    $user = array(
      'id'           => $current_user->ID,
      'username'     => $current_user->user_login,
      'first_name'   => $current_user->user_firstname,
      'last_name'    => $current_user->user_lastname,
      'display_name' => $current_user->display_name,
      'email'        => $current_user->user_email
    );

    $response = array_merge($user, $this->get_key_data( $current_user->ID ));

    return rest_ensure_response( array( $response ) );
  }


  /**
   * Get key data.
   *
   * @param  int $user_id
   * @return array
   */
  private function get_key_data( $user_id ) {
    global $wpdb;

    $empty = array(
      'key_id'          => 0,
      'consumer_key'    => '',
      'consumer_secret' => '',
      'last_access'     => '',
    );

    if ( 0 === $user_id ) {
      return $empty;
    }

    $key = $wpdb->get_row(
      $wpdb->prepare(
        "SELECT key_id, consumer_key, consumer_secret, last_access
				FROM {$wpdb->prefix}woocommerce_api_keys
				WHERE user_id = %d",
        $user_id
      ), ARRAY_A
    );

    if ( is_null( $key ) ) {
      return $empty;
    }

    return $key;
  }


  /**
   * @param \WP_REST_Request $request
   * @return mixed|WP_Error|\WP_REST_Response
   */
  public function update_item( $request ) {
    $response = array();
    //$request->body()
    //key_id
    //user_id
    //consumer_key
    //consumer_secret
    //key_permissions
    return rest_ensure_response( $response );
  }


  /**
   * @param \WP_REST_Request $request
   * @return bool|\WP_Error|\WP_Error
   */
  public function get_items_permissions_check( $request ) {
    if ( false ) {
      return new WP_Error( 'woocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'woocommerce' ), array( 'status' => rest_authorization_required_code() ) );
    }
    return true;
  }


  /**
   * @param \WP_REST_Request $request
   * @return bool|\WP_Error|\WP_Error
   */
  public function update_item_permissions_check( $request ) {
    if ( false ) {
      return new WP_Error( 'woocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'woocommerce' ), array( 'status' => rest_authorization_required_code() ) );
    }
    return true;
  }


  /**
   * @return array
   */
  public function get_item_schema() {
    $schema = array(
      '$schema'    => 'http://json-schema.org/draft-04/schema#',
      'title'      => 'user',
      'type'       => 'object',
      'properties' => array(
        'id'          => array(
          'description' => __( '', 'woocommerce-pos' ),
          'type'        => 'string',
          'context'     => array( 'view' ),
          'readonly'    => true,
        )
      ),
    );
    return $this->add_additional_fields_schema( $schema );
  }

}
