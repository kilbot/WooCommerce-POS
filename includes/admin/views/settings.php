<?php
/**
 * View for the Settings page
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.kilbot.com.au
 */
?>

<div class="wrap clear woocommerce-pos-settings">

	<nav id="wc-pos-settings-tabs"></nav>
	<div id="wc-pos-settings"></div>

	<?php
		$settings = array(
			'general' => array(
				'title' => __( 'General', 'woocommerce-pos' ),
				'sections' => array(
					'example_1' => array(
						'title' => __( 'Example 1', 'woocommerce-pos' ),
						'output' => 'example 1 function'
					),
					'example_2' => array(
						'title' => __( 'Example 2', 'woocommerce-pos' ),
						'output' => 'example 2 function'
					),
				)
			),
			'checkout' => array(
				'title' => __( 'Checkout', 'woocommerce-pos' ),
				'sections' => array(
					'example_3' => array(
						'title' => __( 'Example 3', 'woocommerce-pos' ),
						'output' => 'example 3 function'
					),
					'example_4' => array(
						'title' => __( 'Example 4', 'woocommerce-pos' ),
						'output' => 'example 4 function'
					),
				)
			)
		);
	?>

	<?php foreach( $settings as $setting_id => $setting ): ?>
		<script id='tmpl-wc-pos-settings-<?= $setting_id ?>' type='text/html'>
			<?php foreach( $setting['sections'] as $section_id => $section ) : ?>
				<section id="wc-pos-settings-section-<?= $section_id ?>"></section>
			<?php endforeach; ?>
		</script>

	<?php endforeach; ?>

</div>