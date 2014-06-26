<?php
/**
 * View for the Admin Settings Page
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @license   GPL-2.0+
 * @link      http://www.kilbot.com.au
 * @copyright 2014 The Kilbot Factory
 */
?>

<div class="wrap clear woocommerce woocommerce-pos">
	<form method="post" id="mainform" action="" enctype="multipart/form-data">
		<h2 class="nav-tab-wrapper woo-nav-tab-wrapper">
		<?php 
			foreach( $tabs as $name => $label ) {
				echo '<a href="' . admin_url( 'admin.php?page=wc-pos-settings&tab=' . $name ) . '" class="nav-tab ' . ( $current_tab == $name ? 'nav-tab-active' : '' ) . '">' . $label . '</a>';
			}
		?>
		</h2>

		<?php
			do_action( 'woocommerce_pos_sections_' . $current_tab );
			do_action( 'woocommerce_pos_settings_' . $current_tab );
		?>

        <p class="submit">
        	<?php if ( ! isset( $GLOBALS['hide_save_button'] ) ) : ?>
        		<input name="save" class="button-primary" type="submit" value="<?php _e( 'Save changes', 'woocommerce-pos' ); ?>" />
        	<?php endif; ?>
        	<input type="hidden" name="subtab" id="last_tab" />
        	<?php wp_nonce_field( 'woocommerce-pos-settings' ); ?>
        </p>
	</form>
</div><!-- .wrap -->