<?php

/**
 * POS Admin General Settings Class
 * 
 * @class 	  WC_POS_Settings_General
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
		$this->label = __( 'Checkout', 'woocommerce-pos' );

		// add General tab
		add_filter( 'woocommerce_pos_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
		add_action( 'woocommerce_pos_settings_' . $this->id, array( $this, 'output' ) );
		add_action( 'woocommerce_pos_settings_save_' . $this->id, array( $this, 'save' ) );
		// add_action( 'woocommerce_admin_field_payment_gateways', array( $this, 'payment_gateways_setting' ) );
	}

	/**
	 * Get settings array
	 *
	 * @return array
	 */
	public function get_settings() {

		$customer_id = get_option( $this->default_customer, 0 );

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
			<th scope="row" class="titledesc"><?php _e( 'Gateway Display', 'woocommerce' ) ?></th>
		    <td class="forminp">
				<table class="wc_gateways widefat" cellspacing="0">
					<thead>
						<tr>
							<?php
								$columns = apply_filters( 'woocommerce_payment_gateways_setting_columns', array(
									'default'  => __( 'Default', 'woocommerce' ),
									'name'     => __( 'Gateway', 'woocommerce' ),
									'id'       => __( 'Gateway ID', 'woocommerce' ),
									'status'   => __( 'Status', 'woocommerce' ),
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
			        	$default_gateway = get_option( 'woocommerce_default_gateway' );

			        	foreach ( WC()->payment_gateways->payment_gateways() as $gateway ) {

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
						        			echo '<span class="status-enabled tips" data-tip="' . __ ( 'Enabled', 'woocommerce' ) . '">' . __ ( 'Enabled', 'woocommerce' ) . '</span>';
						        		else
						        			echo '-';

						        		echo '</td>';
									break;
									case 'settings' :
										echo '<td class="settings">
					        				<a class="button" href="' . admin_url( 'admin.php?page=wc-settings&tab=checkout&section=' . strtolower( get_class( $gateway ) ) ) . '">' . __( 'Settings', 'woocommerce' ) . '</a>
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

}

endif;
return new WC_POS_Settings_Checkout();