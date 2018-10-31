<?php

/**
 * POS Customers
 *
 * @package    WCPOS\Customers
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS;

class Customers {

	// whitelist of usermeta which triggers _user_modified_gmt update
	private $usermeta = array(
		// wp data
		'first_name',
		'last_name',
		'nickname',

		// woo order data
		'_order_count',
		'_money_spent',

		// woo customer data
		'billing_first_name',
		'billing_last_name',
		'billing_company',
		'billing_email',
		'billing_phone',
		'billing_address_1',
		'billing_address_2',
		'billing_city',
		'billing_state',
		'billing_postcode',
		'billing_country',

		'shipping_first_name',
		'shipping_last_name',
		'shipping_company',
		'shipping_address_1',
		'shipping_address_2',
		'shipping_city',
		'shipping_state',
		'shipping_postcode',
		'shipping_country',
	);

	public function __construct() {
		add_action( 'profile_update', array( $this, 'profile_update' ) );
		add_action( 'updated_user_meta', array( $this, 'updated_user_meta' ), 10, 4 );
	}

	/**
	 * WP Users has not modified date
	 * POS needs to track which customer profiles have been updated
	 * @param $id
	 */
	public function profile_update( $id ) {
		update_user_meta( $id, '_user_modified_gmt', current_time( 'mysql', 1 ) );
	}

	/**
	 * @param $meta_id
	 * @param $object_id
	 * @param $meta_key
	 * @param $_meta_value
	 */
	public function updated_user_meta( $meta_id, $object_id, $meta_key, $_meta_value ) {
		if ( in_array( $meta_key, $this->usermeta ) ) {
			update_user_meta( $object_id, '_user_modified_gmt', current_time( 'mysql', 1 ) );
		}
	}

}
