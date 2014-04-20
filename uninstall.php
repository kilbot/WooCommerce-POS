<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package   Woocommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @license   GPL-2.0+
 * @link      http://www.kilbot.com.au
 * @copyright 2014 The Kilbot Factory
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