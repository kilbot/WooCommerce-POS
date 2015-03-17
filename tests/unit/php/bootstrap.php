<?php

$_tests_dir = getenv('WP_TESTS_DIR');
if ( !$_tests_dir ) $_tests_dir = '/tmp/wordpress-tests-lib';

require_once $_tests_dir . '/includes/functions.php';

function load_wc_pos() {
  require_once dirname( __FILE__ ) . '/../../../woocommerce-pos.php';
  new WC_POS();
}

function install_wc_pos() {
  WC_POS_Activator::activate(true);
}

tests_add_filter( 'muplugins_loaded', 'load_wc_pos' );
tests_add_filter( 'setup_theme', 'install_wc_pos' );

require_once $_tests_dir . '/includes/bootstrap.php';

activate_plugin(WP_CONTENT_DIR . '/plugins/woocommerce/woocommerce.php');