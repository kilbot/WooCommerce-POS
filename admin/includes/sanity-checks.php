<?php 

function check_api_access() {
	$api_access = false;
	$file_headers = @get_headers( WC_POS()->wc_api_url );
	if($file_headers[0] != 'HTTP/1.1 404 Not Found') {
		$api_access = true;
	}
	return $api_access;
}

function check_api_authentication() {
	$api_auth = false;
	$file_headers = @get_headers( WC_POS()->wc_api_url );
	if($file_headers[0] != 'HTTP/1.1 404 Not Found') {
		$json 		= file_get_contents( WC_POS()->wc_api_url );
		$api_auth 	= substr( $json, 0, 100);
	}
	return $api_auth;
}

function find_orphans_variations() {
	global $wpdb;
	$posts = $wpdb->get_results("SELECT o.ID FROM `".$wpdb->posts."` o
		LEFT OUTER JOIN `".$wpdb->posts."` r
		ON o.post_parent = r.ID
		WHERE r.id IS null AND o.post_type = 'product_variation';
	");

	return $posts ? implode( ', ', $posts ) : false ;
}

// function find_shortcodes() { 
	
// 	// query all products
// 	global $wpdb;
// 	$posts = $wpdb->get_results("SELECT ID, post_content FROM `".$wpdb->posts."`
// 		WHERE (post_type = 'product' OR post_type = 'product_variation');
// 		;
// 	");

// 	// check the_content for possible shortcodes
// 	$shortcodes = array();
// 	foreach ($posts as $post) {
// 		if( preg_match( "^\[(.*?)\]^", $post->post_content, $match ) ) array_push($shortcodes, $post->ID);
// 	}

// 	// return list of post id's
// 	return $shortcodes ? implode( ', ', $shortcodes ) : false ; 
// }