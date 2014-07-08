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

		// add Checkout tab
		add_filter( 'woocommerce_pos_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
		add_action( 'woocommerce_pos_settings_' . $this->id, array( $this, 'output' ) );
		add_action( 'woocommerce_pos_admin_field_payment_gateways', array( $this, 'payment_gateways_setting' ) );
		add_action( 'woocommerce_pos_settings_save_' . $this->id, array( $this, 'save' ) );

		// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 20, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_enabled', array( $this, 'pos_enabled' ), 20, 1 );
	}

	/**
	 * Get settings array
	 *
	 * @return array
	 */
	public function get_settings() {

		$settings = array(
			array( 
				'title' => __( 'Payment Gateways', 'woocommerce-pos' ),  
				'desc' => 
					__( 'Installed gateways are listed below. Drag and drop gateways to control their display order at the Point of Sale. ', 'woocommerce-pos' )
					.'<br>'
					.__( 'Payment Gateways enabled here will be available at the Point of Sale. Payment Gateways enabled on the settings page will be available in your Online Store. ', 'woocommerce-pos' )
					// .__( 'WooCommerce POS uses the . ', 'woocommerce-pos' )
				, 
				'type' => 'title', 
				'id' => 'payment_gateways_options' 
			),
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

			        	foreach ( WC_POS()->payment_gateways()->payment_gateways as $gateway ) {

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
		$this->process_admin_options();
	}

	/**
	 * Save options
	 *
	 * @access public
	 * @return void
	 */
	function process_admin_options() {

		$default_gateway 	= ( isset( $_POST['default_gateway'] ) ) ? esc_attr( $_POST['default_gateway'] ) : '';
		$gateway_order 		= ( isset( $_POST['gateway_order'] ) ) ? $_POST['gateway_order'] : '';
		$gateway_enabled 	= ( isset( $_POST['gateway_enabled'] ) ) ? $_POST['gateway_enabled'] : '';

		$order = array();

		if ( is_array( $gateway_order ) && sizeof( $gateway_order ) > 0 ) {
			$loop = 0;
			foreach ( $gateway_order as $gateway_id ) {
				$order[ esc_attr( $gateway_id ) ] = $loop;
				$loop++;
			}
		}

		update_option( 'woocommerce_pos_default_gateway', $default_gateway );
		update_option( 'woocommerce_pos_gateway_order', $order );
		update_option( 'woocommerce_pos_gateway_enabled', $gateway_enabled );
	}

	/**
	 * Add POS Status column
	 * @param  array $columns
	 * @return array $new_columns
	 */
	public function woocommerce_payment_gateways_setting_columns( $columns ) {
		unset( $columns['pos_status'] );
		$new_columns = array();
		foreach ( $columns as $key => $column ) {
			$new_columns[$key] = $column;
			if( $key == 'status' ) {
				$new_columns['pos_enabled'] = _x( 'POS', 'Payment gateway status', 'woocommerce-pos' );
			}
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function pos_enabled( $gateway ) {

		$gateway_enabled = get_option( 'woocommerce_pos_gateway_enabled' );
		$checked = '';

		echo '<td class="pos_enabled">';
		if ( in_array( $gateway->id, $gateway_enabled ) ) 
			$checked = 'checked';

		echo '<input type="checkbox" name="gateway_enabled[]" value="' . esc_attr( $gateway->id ) . '"' . $checked .' >';
		echo '</td>';
	}

}

endif;
return new WC_POS_Settings_Checkout();