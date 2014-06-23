<?php

/**
 * POS Admin Settings Class
 * matches WooCommerce /includes/admin/class-wc-admin-settings.php
 * 
 * @class 	  WC_POS_Admin_Settings
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_Admin_Settings {

	private static $settings = array();
	private static $errors   = array();
	private static $messages = array();

	/**
	 * Include the settings page classes
	 */
	public static function get_settings_pages() {
		if ( empty( self::$settings ) ) {
			$settings = array();

			include_once( 'settings/class-settings-page.php' );

			$settings[] = include( 'settings/class-settings-general.php' );

			self::$settings = apply_filters( 'woocommerce_pos_get_settings_pages', $settings );
		}
		return self::$settings;
	}

	/**
	 * Save the settings
	 */
	public static function save() {
		global $current_section, $current_tab;

		if ( empty( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( $_REQUEST['_wpnonce'], 'woocommerce-pos-settings' ) )
	    		die( __( 'Action failed. Please refresh the page and retry.', 'woocommerce-pos' ) );

	    // Trigger actions
	   	do_action( 'woocommerce_pos_settings_save_' . $current_tab );
	    do_action( 'woocommerce_pos_update_options_' . $current_tab );
	    do_action( 'woocommerce_pos_update_options' );

	    self::add_message( __( 'Your settings have been saved.', 'woocommerce-pos' ) );

	    do_action( 'woocommerce_pos_settings_saved' );
	}

	/**
	 * Add a message
	 * @param string $text
	 */
	public static function add_message( $text ) {
		self::$messages[] = $text;
	}

	/**
	 * Add an error
	 * @param string $text
	 */
	public static function add_error( $text ) {
		self::$errors[] = $text;
	}

	/**
	 * Output messages + errors
	 */
	public static function show_messages() {
		if ( sizeof( self::$errors ) > 0 ) {
			foreach ( self::$errors as $error )
				echo '<div id="message" class="error fade"><p><strong>' . esc_html( $error ) . '</strong></p></div>';
		} elseif ( sizeof( self::$messages ) > 0 ) {
			foreach ( self::$messages as $message )
				echo '<div id="message" class="updated fade"><p><strong>' . esc_html( $message ) . '</strong></p></div>';
		}
	}

	/**
	 * Settings page
	 */
	public static function output() {
	    global $current_section, $current_tab;

	    // Include settings pages
		self::get_settings_pages();

		// Get current tab/section
		$current_tab = empty( $_GET['tab'] ) ? 'general' : sanitize_title( $_GET['tab'] );
		$current_section = empty( $_REQUEST['section'] ) ? '' : sanitize_title( $_REQUEST['section'] );

	    // Save settings if data has been posted
	    if ( ! empty( $_POST ) )
	    	self::save();

	    // Add any posted messages
	    if ( ! empty( $_GET['wc_error'] ) )
	    	self::add_error( stripslashes( $_GET['wc_error'] ) );

	     if ( ! empty( $_GET['wc_message'] ) )
	    	self::add_message( stripslashes( $_GET['wc_message'] ) );

	    self::show_messages();

		// Get tabs for the settings page
	    $tabs = apply_filters( 'woocommerce_pos_settings_tabs_array', array() );

	    include_once( WC_POS()->plugin_path .'admin/views/settings.php' );

	}

	/**
	 * Get a setting from the settings API.
	 *
	 * @param mixed $option
	 * @return string
	 */
	public static function get_option( $option_name, $default = '' ) {
		// Array value
		if ( strstr( $option_name, '[' ) ) {

			parse_str( $option_name, $option_array );

			// Option name is first key
			$option_name = current( array_keys( $option_array ) );

			// Get value
			$option_values = get_option( $option_name, '' );

			$key = key( $option_array[ $option_name ] );

			if ( isset( $option_values[ $key ] ) )
				$option_value = $option_values[ $key ];
			else
				$option_value = null;

		// Single value
		} else {
			$option_value = get_option( $option_name, null );
		}

		if ( is_array( $option_value ) )
			$option_value = array_map( 'stripslashes', $option_value );
		elseif ( ! is_null( $option_value ) )
			$option_value = stripslashes( $option_value );

		return $option_value === null ? $default : $option_value;
	}

	/**
	 * Output admin fields.
	 *
	 * Loops though the woocommerce options array and outputs each field.
	 *
	 * @access public
	 * @param array $options Opens array to output
	 */
	public static function output_fields( $options ) {
	    foreach ( $options as $value ) {
	    	if ( ! isset( $value['type'] ) ) continue;
	    	if ( ! isset( $value['id'] ) ) $value['id'] = '';
	    	if ( ! isset( $value['title'] ) ) $value['title'] = isset( $value['name'] ) ? $value['name'] : '';
	    	if ( ! isset( $value['class'] ) ) $value['class'] = '';
	    	if ( ! isset( $value['css'] ) ) $value['css'] = '';
	    	if ( ! isset( $value['default'] ) ) $value['default'] = '';
	    	if ( ! isset( $value['desc'] ) ) $value['desc'] = '';
	    	if ( ! isset( $value['desc_tip'] ) ) $value['desc_tip'] = false;

	    	// Custom attribute handling
			$custom_attributes = array();

			if ( ! empty( $value['custom_attributes'] ) && is_array( $value['custom_attributes'] ) )
				foreach ( $value['custom_attributes'] as $attribute => $attribute_value )
					$custom_attributes[] = esc_attr( $attribute ) . '="' . esc_attr( $attribute_value ) . '"';

			// Description handling
			if ( $value['desc_tip'] === true ) {
				$description = '';
				$tip = $value['desc'];
			} elseif ( ! empty( $value['desc_tip'] ) ) {
				$description = $value['desc'];
				$tip = $value['desc_tip'];
			} elseif ( ! empty( $value['desc'] ) ) {
				$description = $value['desc'];
				$tip = '';
			} else {
				$description = $tip = '';
			}

			if ( $description && in_array( $value['type'], array( 'textarea', 'radio' ) ) ) {
				$description = '<p style="margin-top:0">' . wp_kses_post( $description ) . '</p>';
			} elseif ( $description && in_array( $value['type'], array( 'checkbox' ) ) ) {
				$description =  wp_kses_post( $description );
			} elseif ( $description ) {
				$description = '<span class="description">' . wp_kses_post( $description ) . '</span>';
			}

			if ( $tip && in_array( $value['type'], array( 'checkbox' ) ) ) {

				$tip = '<p class="description">' . $tip . '</p>';

			} elseif ( $tip ) {

				$tip = '<img class="help_tip" data-tip="' . esc_attr( $tip ) . '" src="' . WC()->plugin_url() . '/assets/images/help.png" height="16" width="16" />';

			}

			// Switch based on type
	        switch( $value['type'] ) {

	        	// Section Titles
	            case 'title':
	            	if ( ! empty( $value['title'] ) ) {
	            		echo '<h3>' . esc_html( $value['title'] ) . '</h3>';
	            	}
	            	if ( ! empty( $value['desc'] ) ) {
	            		echo wpautop( wptexturize( wp_kses_post( $value['desc'] ) ) );
	            	}
	            	echo '<table class="form-table">'. "\n\n";
	            	if ( ! empty( $value['id'] ) ) {
	            		do_action( 'woocommerce_settings_' . sanitize_title( $value['id'] ) );
	            	}
	            break;

	            // Section Ends
	            case 'sectionend':
	            	if ( ! empty( $value['id'] ) ) {
	            		do_action( 'woocommerce_settings_' . sanitize_title( $value['id'] ) . '_end' );
	            	}
	            	echo '</table>';
	            	if ( ! empty( $value['id'] ) ) {
	            		do_action( 'woocommerce_settings_' . sanitize_title( $value['id'] ) . '_after' );
	            	}
	            break;

	            // Standard text inputs and subtypes like 'number'
	            case 'text':
	            case 'email':
	            case 'number':
	            case 'color' :
	            case 'password' :

	            	$type 			= $value['type'];
	            	$class 			= '';
	            	$option_value 	= self::get_option( $value['id'], $value['default'] );

	            	if ( $value['type'] == 'color' ) {
	            		$type = 'text';
	            		$value['class'] .= 'colorpick';
		            	$description .= '<div id="colorPickerDiv_' . esc_attr( $value['id'] ) . '" class="colorpickdiv" style="z-index: 100;background:#eee;border:1px solid #ccc;position:absolute;display:none;"></div>';
	            	}

	            	?><tr valign="top">
						<th scope="row" class="titledesc">
							<label for="<?php echo esc_attr( $value['id'] ); ?>"><?php echo esc_html( $value['title'] ); ?></label>
							<?php echo $tip; ?>
						</th>
	                    <td class="forminp forminp-<?php echo sanitize_title( $value['type'] ) ?>">
	                    	<input
	                    		name="<?php echo esc_attr( $value['id'] ); ?>"
	                    		id="<?php echo esc_attr( $value['id'] ); ?>"
	                    		type="<?php echo esc_attr( $type ); ?>"
	                    		style="<?php echo esc_attr( $value['css'] ); ?>"
	                    		value="<?php echo esc_attr( $option_value ); ?>"
	                    		class="<?php echo esc_attr( $value['class'] ); ?>"
	                    		<?php echo implode( ' ', $custom_attributes ); ?>
	                    		/> <?php echo $description; ?>
	                    </td>
	                </tr><?php
	            break;

	            // Textarea
	            case 'textarea':

	            	$option_value 	= self::get_option( $value['id'], $value['default'] );

	            	?><tr valign="top">
						<th scope="row" class="titledesc">
							<label for="<?php echo esc_attr( $value['id'] ); ?>"><?php echo esc_html( $value['title'] ); ?></label>
							<?php echo $tip; ?>
						</th>
	                    <td class="forminp forminp-<?php echo sanitize_title( $value['type'] ) ?>">
	                    	<?php echo $description; ?>

	                        <textarea
	                        	name="<?php echo esc_attr( $value['id'] ); ?>"
	                        	id="<?php echo esc_attr( $value['id'] ); ?>"
	                        	style="<?php echo esc_attr( $value['css'] ); ?>"
	                        	class="<?php echo esc_attr( $value['class'] ); ?>"
	                        	<?php echo implode( ' ', $custom_attributes ); ?>
	                        	><?php echo esc_textarea( $option_value );  ?></textarea>
	                    </td>
	                </tr><?php
	            break;

	            // Select boxes
	            case 'select' :
	            case 'multiselect' :

	            	$option_value 	= self::get_option( $value['id'], $value['default'] );

	            	?><tr valign="top">
						<th scope="row" class="titledesc">
							<label for="<?php echo esc_attr( $value['id'] ); ?>"><?php echo esc_html( $value['title'] ); ?></label>
							<?php echo $tip; ?>
						</th>
	                    <td class="forminp forminp-<?php echo sanitize_title( $value['type'] ) ?>">
	                    	<select
	                    		name="<?php echo esc_attr( $value['id'] ); ?><?php if ( $value['type'] == 'multiselect' ) echo '[]'; ?>"
	                    		id="<?php echo esc_attr( $value['id'] ); ?>"
	                    		style="<?php echo esc_attr( $value['css'] ); ?>"
	                    		class="<?php echo esc_attr( $value['class'] ); ?>"
	                    		<?php echo implode( ' ', $custom_attributes ); ?>
	                    		<?php if ( $value['type'] == 'multiselect' ) echo 'multiple="multiple"'; ?>
	                    		>
		                    	<?php
			                        foreach ( $value['options'] as $key => $val ) {
			                        	?>
			                        	<option value="<?php echo esc_attr( $key ); ?>" <?php

				                        	if ( is_array( $option_value ) )
				                        		selected( in_array( $key, $option_value ), true );
				                        	else
				                        		selected( $option_value, $key );

			                        	?>><?php echo $val ?></option>
			                        	<?php
			                        }
			                    ?>
	                       </select> <?php echo $description; ?>
	                    </td>
	                </tr><?php
	            break;

	            // Radio inputs
	            case 'radio' :

	            	$option_value 	= self::get_option( $value['id'], $value['default'] );

	            	?><tr valign="top">
						<th scope="row" class="titledesc">
							<label for="<?php echo esc_attr( $value['id'] ); ?>"><?php echo esc_html( $value['title'] ); ?></label>
							<?php echo $tip; ?>
						</th>
	                    <td class="forminp forminp-<?php echo sanitize_title( $value['type'] ) ?>">
	                    	<fieldset>
	                    		<?php echo $description; ?>
	                    		<ul>
	                    		<?php
	                    			foreach ( $value['options'] as $key => $val ) {
			                        	?>
			                        	<li>
			                        		<label><input
				                        		name="<?php echo esc_attr( $value['id'] ); ?>"
				                        		value="<?php echo $key; ?>"
				                        		type="radio"
					                    		style="<?php echo esc_attr( $value['css'] ); ?>"
					                    		class="<?php echo esc_attr( $value['class'] ); ?>"
					                    		<?php echo implode( ' ', $custom_attributes ); ?>
					                    		<?php checked( $key, $option_value ); ?>
				                        		/> <?php echo $val ?></label>
			                        	</li>
			                        	<?php
			                        }
	                    		?>
	                    		</ul>
	                    	</fieldset>
	                    </td>
	                </tr><?php
	            break;

	            // Checkbox input
	            case 'checkbox' :

					$option_value    = self::get_option( $value['id'], $value['default'] );
					$visbility_class = array();

	            	if ( ! isset( $value['hide_if_checked'] ) ) {
	            		$value['hide_if_checked'] = false;
	            	}
	            	if ( ! isset( $value['show_if_checked'] ) ) {
	            		$value['show_if_checked'] = false;
	            	}
	            	if ( $value['hide_if_checked'] == 'yes' || $value['show_if_checked'] == 'yes' ) {
	            		$visbility_class[] = 'hidden_option';
	            	}
	            	if ( $value['hide_if_checked'] == 'option' ) {
	            		$visbility_class[] = 'hide_options_if_checked';
	            	}
	            	if ( $value['show_if_checked'] == 'option' ) {
	            		$visbility_class[] = 'show_options_if_checked';
	            	}

	            	if ( ! isset( $value['checkboxgroup'] ) || 'start' == $value['checkboxgroup'] ) {
	            		?>
		            		<tr valign="top" class="<?php echo esc_attr( implode( ' ', $visbility_class ) ); ?>">
								<th scope="row" class="titledesc"><?php echo esc_html( $value['title'] ) ?></th>
								<td class="forminp forminp-checkbox">
									<fieldset>
						<?php
	            	} else {
	            		?>
		            		<fieldset class="<?php echo esc_attr( implode( ' ', $visbility_class ) ); ?>">
	            		<?php
	            	}

	            	if ( ! empty( $value['title'] ) ) {
	            		?>
	            			<legend class="screen-reader-text"><span><?php echo esc_html( $value['title'] ) ?></span></legend>
	            		<?php
	            	}

	            	?>
						<label for="<?php echo $value['id'] ?>">
							<input
								name="<?php echo esc_attr( $value['id'] ); ?>"
								id="<?php echo esc_attr( $value['id'] ); ?>"
								type="checkbox"
								value="1"
								<?php checked( $option_value, 'yes'); ?>
								<?php echo implode( ' ', $custom_attributes ); ?>
							/> <?php echo $description ?>
						</label> <?php echo $tip; ?>
					<?php

					if ( ! isset( $value['checkboxgroup'] ) || 'end' == $value['checkboxgroup'] ) {
									?>
									</fieldset>
								</td>
							</tr>
						<?php
					} else {
						?>
							</fieldset>
						<?php
					}
	            break;

	            // Single page selects
	            case 'single_select_page' :

	            	$args = array( 'name'				=> $value['id'],
	            				   'id'					=> $value['id'],
	            				   'sort_column' 		=> 'menu_order',
	            				   'sort_order'			=> 'ASC',
	            				   'show_option_none' 	=> ' ',
	            				   'class'				=> $value['class'],
	            				   'echo' 				=> false,
	            				   'selected'			=> absint( self::get_option( $value['id'] ) )
	            				   );

	            	if( isset( $value['args'] ) )
	            		$args = wp_parse_args( $value['args'], $args );

	            	?><tr valign="top" class="single_select_page">
	                    <th scope="row" class="titledesc"><?php echo esc_html( $value['title'] ) ?> <?php echo $tip; ?></th>
	                    <td class="forminp">
				        	<?php echo str_replace(' id=', " data-placeholder='" . __( 'Select a page&hellip;', 'woocommerce-pos' ) .  "' style='" . $value['css'] . "' class='" . $value['class'] . "' id=", wp_dropdown_pages( $args ) ); ?> <?php echo $description; ?>
				        </td>
	               	</tr><?php
	            break;

	            // Default: run an action
	            default:
	            	do_action( 'woocommerce_pos_admin_field_' . $value['type'], $value );
	            break;
	    	}
		}
	}

	/**
	 * Save admin fields.
	 *
	 * Loops though the woocommerce options array and outputs each field.
	 *
	 * @access public
	 * @param array $options Opens array to output
	 * @return bool
	 */
	public static function save_fields( $options ) {
		if ( empty( $_POST ) )
	    	return false;

	    // Options to update will be stored here
	    $update_options = array();

	    // Loop options and get values to save
	    foreach ( $options as $value ) {

	    	if ( ! isset( $value['id'] ) )
	    		continue;

	    	$type = isset( $value['type'] ) ? sanitize_title( $value['type'] ) : '';

	    	// Get the option name
	    	$option_value = null;

	    	switch ( $type ) {

		    	// Standard types
		    	case "checkbox" :

		    		if ( isset( $_POST[ $value['id'] ] ) ) {
		    			$option_value = 'yes';
		            } else {
		            	$option_value = 'no';
		            }

		    	break;

		    	case "textarea" :

			    	if ( isset( $_POST[$value['id']] ) ) {
			    		$option_value = wp_kses_post( trim( stripslashes( $_POST[ $value['id'] ] ) ) );
		            } else {
		                $option_value = '';
		            }

		    	break;

		    	case "text" :
		    	case 'email':
	            case 'number':
		    	case "select" :
		    	case "color" :
	            case 'password' :
		    	case "single_select_page" :
		    	case 'radio' :

			       if ( isset( $_POST[$value['id']] ) ) {
		            	$option_value = wc_clean( stripslashes( $_POST[ $value['id'] ] ) );
		            } else {
		                $option_value = '';
		            }

		    	break;

		    	// Custom handling
		    	default :

		    		// do_action( 'woocommerce_update_option_' . $type, $value );

		    	break;

	    	}

	    	if ( ! is_null( $option_value ) ) {
		    	// Check if option is an array
				if ( strstr( $value['id'], '[' ) ) {

					parse_str( $value['id'], $option_array );

		    		// Option name is first key
		    		$option_name = current( array_keys( $option_array ) );

		    		// Get old option value
		    		if ( ! isset( $update_options[ $option_name ] ) )
		    			 $update_options[ $option_name ] = get_option( $option_name, array() );

		    		if ( ! is_array( $update_options[ $option_name ] ) )
		    			$update_options[ $option_name ] = array();

		    		// Set keys and value
		    		$key = key( $option_array[ $option_name ] );

		    		$update_options[ $option_name ][ $key ] = $option_value;

				// Single value
				} else {
					$update_options[ $value['id'] ] = $option_value;
				}
			}

			// Custom handling
	    	// do_action( 'woocommerce_update_option', $value );
	    }

	    // Now save the options
	    foreach( $update_options as $name => $value )
	    	update_option( $name, $value );

	    return true;
	}

}