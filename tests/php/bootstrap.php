<?php

$_tests_dir = getenv('WP_TESTS_DIR');
if ( !$_tests_dir ) $_tests_dir = '/tmp/wordpress-tests-lib';

require_once $_tests_dir . '/includes/functions.php';

function load_wc_pos() {
	require_once dirname( __FILE__ ) . '/../../woocommerce-pos.php';
}

tests_add_filter( 'muplugins_loaded', 'load_wc_pos' );

require_once $_tests_dir . '/includes/bootstrap.php';