<?php
/**
 * View for the Pro License Activation and Deactivation
 *
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @license   GPL-2.0+
 * @link      http://www.kilbot.com.au
 * @copyright 2014 The Kilbot Factory
 */
?>

<div class="wrap clear">
	<?php
	// Check for transient, if none, grab remote HTML file
	if ( false === ( $html = get_transient( 'remote_pro_content' ) ) ) {

		// Get remote HTML file
		$response = wp_remote_get( 'http://woopos.com.au/pro/content/' );

			// Check for error
			if ( is_wp_error( $response ) ) {
				return;
			}

		// Parse remote HTML file
		$html = wp_remote_retrieve_body( $response );

			// Check for error
			if ( is_wp_error( $html ) ) {
				return;
			}

		// Store remote HTML file in transient, expire after 24 hours
		set_transient( 'remote_pro_content', $html, 24 * HOUR_IN_SECONDS );

	}

	echo $html;
	?>
</div>