<?php

/**
 * Support Class
 * 
 * @class 	  WooCommerce_POS_Support
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Support {

	public function __construct() {

		// include the wc api wrapper for testing
		include_once( 'class-pos-tools.php' );
		$this->tools = new WooCommerce_POS_Tools();
	}

	public function support_form() {
		$show_form = true;
		$errors = array();

		if ( isset( $_POST['email-support'] ) && wp_verify_nonce( $_POST['email_support_nonce'], 'email_support' ) ) {

			$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
			$email = filter_var( $_POST['email'], FILTER_SANITIZE_EMAIL );
			$message = filter_var($_POST['message'], FILTER_SANITIZE_STRING) . "\n\n\n"; 

			if( in_array( 'pos', $_POST['reports'] ) ) {
				$message .= $_POST['pos_status'];
			}

			// validation
			if ( $name == '' ) 
				$errors[] = __( 'Please enter your name', 'woocommerce-pos' );

			if ( !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) 
				$errors[] = __( 'Please enter a valid email address', 'woocommerce-pos' );
			
			if ( $message == '' ) 
				$errors[] = __( 'Please enter your message', 'woocommerce-pos' );

			$headers[] = 'From: '. $name .' <'. $email .'>';
			
			if( empty($errors) && wp_mail( 'support@woopos.com.au', 'WooCommerce POS Support', $message, $headers ) ) {
				$show_form = false;

			} else {
				$error_msg = '<p class="panel-body error">';
				$error_msg .= __( 'There was a problem sending your email.', 'woocommerce-pos' ) . '<br>';
				if($errors) {
					$error_msg .= '<ul>';
					foreach( $errors as $error )  {
						$error_msg .= '<li>'. $error .'</li>';
					}
					$error_msg .= '</ul>';
				}
				$error_msg .= '</p>';
				echo $error_msg;
			}
		}

		return $show_form;
	}

	public function pos_status() {
		$this->process_status_actions();

		$checks = array(
			'wc_version_check' => array(
				'title' => __( 'WooCommerce Version', 'woocommerce-pos' ),
				'test' 	=> $this->tools->wc_version_check(),
				'pass' 	=> esc_html( WC()->version ),
				'fail' 	=> __( 'WooCommerce >= 2.1 required', 'woocommerce-pos' ),
				'action'=> admin_url('update-core.php'),
				'prompt'=> __( 'Update', 'woocommerce-pos' ),
			),
			'check_api_active' => array(
				'title' => __( 'WC REST API', 'woocommerce-pos' ),
				'test' 	=> $this->tools->check_api_active(),
				'pass' 	=> __( 'API is active', 'woocommerce-pos' ),
				'fail' 	=> __( 'Access to the REST API is required', 'woocommerce-pos' ),
				'action'=> admin_url('admin.php?page=wc-settings'),
				'prompt'=> __( 'Enable REST API', 'woocommerce-pos' ),
			),
			// 'check_orphan_variations' => array(
			// 	'title' => __( 'Orphaned Variations', 'woocommerce-pos' ),
			// 	'test' 	=> !$this->tools->check_orphan_variations(),
			// 	'pass' 	=> __( 'No orphans.', 'woocommerce-pos' ),
			// 	'fail' 	=> sprintf( __( 'Some of your variations have no parent. The post ids of the orphans are: %s', 'woocommerce-pos' ), '<code style="font-size:0.8em">'. $this->tools->orphans .'</code>' ),
			// 	'action'=> wp_nonce_url( WC_POS()->pos_url('support?action=delete_orphans'), 'debug_action' ),
			// 	'prompt'=> __( 'Delete orphans', 'woocommerce-pos' ),
			// ),
			array(
				'title' => __( 'API Authentication', 'woocommerce-pos' ),
				'test' 	=> $this->tools->check_api_auth(),
				'pass' 	=> __( 'Authentication Passed', 'woocommerce-pos' ) . ' <a href="#" class="toggle"><i class="icon icon-info-circle"></i></a><textarea readonly="readonly" class="small form-control" style="display:none">' . $this->tools->auth_response . '</textarea>',
				'fail' 	=> __( 'Authentication Failed', 'woocommerce-pos' ) . ' <a href="#" class="toggle"><i class="icon icon-info-circle"></i></a><textarea readonly="readonly" class="small form-control" style="display:none">' . $this->tools->auth_response . '</textarea>',
			),
		);

		foreach ( $checks as $check ) {
			if( $check['test'] ) {
				$row = '<tr class="pass"><td><i class="icon icon-check"></i></td><td>'. $check['title'] .'</td><td colspan="2">'. $check['pass'] .'</td></tr>'."\n";
			} else {
				$row = '<tr class="fail"><td><i class="icon icon-times"></i></td><td>'. $check['title'] .'</td><td>'. $check['fail'] .'</td>';
				if( isset( $check['action'] ) && isset( $check['action'] ) ) 
					$row .= '<td><a class="btn btn-primary" href="'. $check['action'] .'">'. $check['prompt'] .'</a></td>';
				$row .= '</tr>'."\n";
			}
			echo $row;
		}

	}

	public function woocommerce_status() {

	}

	public function process_status_actions() {
		if ( ! empty( $_GET['action'] ) && ! empty( $_REQUEST['_wpnonce'] ) && wp_verify_nonce( $_REQUEST['_wpnonce'], 'debug_action' ) ) {
			
			switch( $_GET['action'] ) {
				case 'delete_orphans':
					$this->tools->delete_orphan_variations();
				break;
			}
		}
	}

}