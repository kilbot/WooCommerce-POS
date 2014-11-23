<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, consider the following flow
 * of control:
 *
 * - This method should be static
 * - Check if the $_REQUEST content actually is the plugin name
 * - Run an admin referrer check to make sure it goes through authentication
 * - Verify the output of $_GET makes sense
 * - Repeat with other user roles. Best directly by using the links/query string parameters.
 * - Repeat things for multisite. Once for a single site in the network, once sitewide.
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

// If uninstall not called from WordPress, then exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/* @TODO: delete all transient, options and files you may have added
delete_transient( 'TRANSIENT_NAME' );
delete_option('OPTION_NAME');
//info: remove custom file directory for main site
$upload_dir = wp_upload_dir();
$directory = $upload_dir['basedir'] . DIRECTORY_SEPARATOR . "CUSTOM_DIRECTORY_NAME" . DIRECTORY_SEPARATOR;
if (is_dir($directory)) {
foreach(glob($directory.'*.*') as $v){
unlink($v);
}
rmdir($directory);
}
//info: remove and optimize tables
$GLOBALS['wpdb']->query("DROP TABLE `".$GLOBALS['wpdb']->prefix."TABLE_NAME`");
$GLOBALS['wpdb']->query("OPTIMIZE TABLE `" .$GLOBALS['wpdb']->prefix."options`");
 */



//global $wpdb;
//$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'woocommerce_pos_%'" );