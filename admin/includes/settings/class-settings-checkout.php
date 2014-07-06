<?php

/**
 * POS Admin Checkout/Payment Settings Class
 * 
 * @class 	  WC_POS_Settings_Checkout
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
if ( ! class_exists( 'WC_POS_Settings_Checkout' ) ) :

class WC_POS_Settings_Checkout extends WC_POS_Settings_Page {

	/**
	 * @var mixed
	 */
	public $default_customer;

	public function __construct() {
		$this->id    = 'checkout';
		$this->label = _x( 'Checkout', 'Settings tab label', 'woocommerce-pos' );

		// 
		add_action( 'plugins_loaded', 'plugins_loaded' );

		// add Checkout tab
		add_filter( 'woocommerce_pos_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
		add_action( 'woocommerce_pos_settings_' . $this->id, array( $this, 'output' ) );
		add_action( 'woocommerce_pos_admin_field_payment_gateways', array( $this, 'payment_gateways_setting' ) );
		add_action( 'woocommerce_pos_settings_save_' . $this->id, array( $this, 'save' ) );

		// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 99, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( $this, 'pos_status' ), 100, 1 );
	}

	function plugins_loaded() {
		remove_action( 'woocommerce_payment_gateways_setting_column_pos_status', array( WooCommerce_POS_Admin_Hooks::get_instance(), 'pos_status' ), 99, 1 );
	}

	/**
	 * Get settings array
	 *
	 * @return array
	 */
	public function get_settings() {

		$settings = array(
			array( 'title' => __( 'Payment Gateways', 'woocommerce-pos' ),  'desc' => __( 'Installed gateways are listed below. Drag and drop gateways to control their display order on the frontend.', 'woocommerce-pos' ), 'type' => 'title', 'id' => 'payment_gateways_options' ),
			array( 'type' => 'payment_gateways' ),
			array( 'type' => 'sectionend', 'id' => 'payment_gateways_options' ),
		);
		
		return $settings;
	}


	/**
	 * Output payment gateway settings.
	 *
	 * @access public
	 * @return void
	 */
	public function payment_gateways_setting() {
		?>
		<tr valign="top">
			<th scope="row" class="titledesc"><?php _e( 'Gateway Display', 'woocommerce-pos' ) ?></th>
		    <td class="forminp">
				<table class="wc_gateways widefat" cellspacing="0">
					<thead>
						<tr>
							<?php
								$columns = apply_filters( 'woocommerce_payment_gateways_setting_columns', array(
									'default'  => __( 'Default', 'woocommerce-pos' ),
									'name'     => __( 'Gateway', 'woocommerce-pos' ),
									'id'       => __( 'Gateway ID', 'woocommerce-pos' ),
									'status'   => __( 'Status', 'woocommerce-pos' ),
									'settings' => ''
								) );

								foreach ( $columns as $key => $column ) {
									echo '<th class="' . esc_attr( $key ) . '">' . esc_html( $column ) . '</th>';
								}
							?>
						</tr>
					</thead>
					<tbody>
			        	<?php
			        	$default_gateway = get_option( 'woocommerce_pos_default_gateway' );

			        	foreach ( WC()->payment_gateways->payment_gateways() as $gateway ) {
			        		// print_r($gateway);

			        		echo '<tr>';

			        		foreach ( $columns as $key => $column ) {
								switch ( $key ) {
									case 'default' :
										echo '<td width="1%" class="default">
					        				<input type="radio" name="default_gateway" value="' . esc_attr( $gateway->id ) . '" ' . checked( $default_gateway, esc_attr( $gateway->id ), false ) . ' />
					        				<input type="hidden" name="gateway_order[]" value="' . esc_attr( $gateway->id ) . '" />
					        			</td>';
									break;
									case 'name' :
										echo '<td class="name">
					        				' . $gateway->get_title() . '
					        			</td>';
									break;
									case 'id' :
										echo '<td class="id">
					        				' . esc_html( $gateway->id ) . '
					        			</td>';
									break;
									case 'status' :
										echo '<td class="status">';

						        		if ( $gateway->enabled == 'yes' )
						        			echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce-pos' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
						        		else
						        			echo '-';

						        		echo '</td>';
									break;
									case 'settings' :
										echo '<td class="settings">
					        				<a class="button" href="' . admin_url( 'admin.php?page=wc-settings&tab=checkout&section=' . strtolower( get_class( $gateway ) ) ) . '">' . __( 'Settings', 'woocommerce-pos' ) . '</a>
					        			</td>';
									break;
									default :
										do_action( 'woocommerce_payment_gateways_setting_column_' . $key, $gateway );
									break;
								}
							}

							echo '</tr>';
			        	}
			        	?>
					</tbody>
				</table>
			</td>
		</tr>
		<?php
	}

	/**
	 * Save settings
	 */
	public function save() {
		$settings = $this->get_settings();
		WC_POS_Admin_Settings::save_fields( $settings );
	}

	/**
	 * Add POS Status column
	 * @param  array $columns
	 * @return array $new_columns
	 */
	public function woocommerce_payment_gateways_setting_columns( $columns ) {
		$columns['status'] = _x( 'Online Store', 'Payment gateway status', 'woocommerce-pos' );
		return $columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function pos_status( $gateway ) {
		echo '<td class="pos_status">';
		// if ( $gateway->enabled == 'yes' )
		if ( true )
		echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce-pos' ) . '">' . __ ( 'Enabled', 'woocommerce-pos' ) . '</span>';
		else
		echo '-';
		echo '</td>';
	}

}

endif;
return new WC_POS_Settings_Checkout();