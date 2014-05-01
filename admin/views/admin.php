<?php
/**
 * Represents the view for the administration dashboard.
 *
 * This includes the header, options, and other information that should provide
 * The User Interface to the end user.
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @license   GPL-2.0+
 * @link      http://www.kilbot.com.au
 * @copyright 2014 The Kilbot Factory
 */
?>

<div class="wrap about-wrap">

	<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

	<div class="about-text">
		<p>A simple front-end for taking WooCommerce orders at the Point of Sale.</p>
	</div>

	<div class="message" style="background-color:#fff;padding:20px;">
		<h3>Thanks for installing WooCommerce POS!</h3>
		<p><a href="<?= home_url('pos/'); ?>">Click here</a> to see start taking orders.</p>
		<p>
			The plugin is currently in it's first public beta - it is not meant for production use. 
			Updates will be frequent over the next few weeks so please check back often.
		</p>
		<p>If you have questions, comments, feature requests or bug reports please do get in contact so we can make this plugin better:</p>
		<ul>
			<li>Website: <a href="http://woopos.com.au">http://woopos.com.au</a></li>
			<li>GitHub: <a href="https://github.com/kilbot/WooCommerce-POS">https://github.com/kilbot/WooCommerce-POS</a></li>
		</ul>
	</div>

</div>

