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

	public function __construct() {
		$this->id    = 'checkout';
		$this->label = _x( 'Checkout', 'Settings tab label', 'woocommerce-pos' );

		// add Checkout tab
		add_filter( 'woocommerce_pos_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
		add_action( 'woocommerce_pos_sections_' . $this->id, array( $this, 'output_sections' ) );
		add_action( 'woocommerce_pos_settings_' . $this->id, array( $this, 'output' ) );
		add_action( 'woocommerce_pos_admin_field_payment_gateways', array( $this, 'payment_gateways_setting' ) );
		add_action( 'woocommerce_pos_settings_save_' . $this->id, array( $this, 'save' ) );

		// add column to WooCommerce Gateway display
		add_filter( 'woocommerce_payment_gateways_setting_columns', array( $this, 'woocommerce_payment_gateways_setting_columns' ), 20, 1 );
		add_action( 'woocommerce_payment_gateways_setting_column_pos_enabled', array( $this, 'enabled_gateways' ), 20, 1 );

		// need to init Payment Gateways for section tabs, settings table etc
		WC_POS()->payment_gateways();
	}

	/**
	 * Get sections
	 *
	 * @return array
	 */
	public function get_sections() {
		$sections = array(
			''         => __( 'Checkout Options', 'woocommerce-pos' )
		);

		$pos_only_gateways = apply_filters( 'woocommerce_pos_payment_gateways', array(
			'POS_Gateway_Cash',
			'POS_Gateway_Card'
		) );

		foreach( $pos_only_gateways as $gateway ) {
			$payment_gateways[] = new $gateway();
		}

		foreach ( $payment_gateways as $gateway ) {
			$title = empty( $gateway->method_title ) ? ucfirst( $gateway->id ) : $gateway->method_title;
			$sections[ strtolower( get_class( $gateway ) ) ] = esc_html( $title );
		}

		return apply_filters( 'woocommerce_pos_get_sections_' . $this->id, $sections );
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

			        	foreach ( WC_POS()->payment_gateways()->get_payment_gateways() as $gateway ) {

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
										if( $gateway->id == 'pos_cash' || $gateway->id == 'pos_card' ) {
											echo '<td class="settings">
					        					<a class="button" href="' . admin_url( 'admin.php?page=wc-pos-settings&tab=checkout&section=' . strtolower( get_class( $gateway ) ) ) . '">' . __( 'Settings', 'woocommerce-pos' ) . '</a>
					        				</td>';
										} else {
											echo '<td class="settings">
					        					<a class="button" href="' . admin_url( 'admin.php?page=wc-settings&tab=checkout&section=' . strtolower( get_class( $gateway ) ) ) . '">' . __( 'Settings', 'woocommerce-pos' ) . '</a>
					        				</td>';
										}
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
	 * Output the settings
	 */
	public function output() {
		global $current_section;

		if ( $current_section ) {
 			foreach ( WC_POS()->payment_gateways()->get_payment_gateways() as $gateway ) {
				if ( strtolower( get_class( $gateway ) ) == strtolower( $current_section ) ) {
					$gateway->admin_options();
					break;
				}
			}
 		} else {
			$settings = $this->get_settings();
			WC_POS_Admin_Settings::output_fields( $settings );
		}
	}

	/**
	 * Save settings
	 */
	public function save() {
		global $current_section;

		if ( ! $current_section ) {

			$settings = $this->get_settings();
			WC_POS_Admin_Settings::save_fields( $settings );
			$this->process_admin_options();

		} elseif ( class_exists( $current_section ) ) {

			$current_section_class = new $current_section();
			do_action( 'woocommerce_pos_update_options_payment_gateways_' . $current_section_class->id );
		}
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
		$enabled_gateways 	= ( isset( $_POST['enabled_gateways'] ) ) ? $_POST['enabled_gateways'] : '';

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
		update_option( 'woocommerce_pos_enabled_gateways', $enabled_gateways );
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
				$new_columns['pos_enabled'] = __( 'POS', 'woocommerce-pos' );
			}
		}
		return $new_columns;
	}

	/**
	 * POS Status for each gateway
	 * @param  object $gateway
	 */
	public function enabled_gateways( $gateway ) {
		$checked = '';
		$enabled_gateways = (array) get_option( 'woocommerce_pos_enabled_gateways' );

		if ( in_array( $gateway->id, $enabled_gateways ) ) 
			$checked = 'checked';

		echo '<td class="pos_enabled">';
		if( in_array( get_class( $gateway ), WC_POS()->payment_gateways()->available_gateways ) ) {
			echo '<input type="checkbox" name="enabled_gateways[]" value="' . esc_attr( $gateway->id ) . '"' . $checked .' >';
		} else {
			echo '<span class="status-disabled tips" data-tip="' . __ ( 'Upgrade to Pro', 'woocommerce-pos' ) . '">' . __ ( 'Upgrade to Pro', 'woocommerce-pos' ) . '</span>';
		}
		echo '</td>';
	}

}

endif;
return new WC_POS_Settings_Checkout();