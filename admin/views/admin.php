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

<div class="wrap clear">

	<div>
		<h1 style="font-size:2.4em;font-weight:normal"><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<p style="font-size:1.4em" class="about-text">A simple front-end for taking WooCommerce orders at the Point of Sale.</p>
	</div>
	
	<div id="poststuff" style="margin-right:20px">
	
		<div id="post-body" class="metabox-holder columns-2">
		
			<!-- main content -->
			<div style="font-size:2em" id="post-body-content">
				<div class="meta-box-sortables">
					<div class="postbox">
						<h3 style="cursor:auto;">Thanks for installing WooCommerce POS!</h3>
						<div class="inside">
							<p><a href="<?= home_url('pos/'); ?>">Click here</a> to see start taking orders.</p>
							<p>
								<u>The plugin is currently in it's first public beta</u> - it is not meant for production use. 
								Updates will be frequent over the next few weeks so please <a href="http://woopos.com.au/wp-admin/update-core.php?force-check=1">check</a> back often.
							</p>
							<h4>The following features are currently being worked on:</h4>
							<ul style="list-style:disc outside none; margin-left:20px;">
								<li>Local storage for inventory</li>
								<li>Change item price in cart</li>
								<li>Add discounts and coupons to orders</li>
								<li>Assign order to existing customer</li>
								<li>Print/Email receipt</li>
								<li>Select payment method, eg: cash, card</li>
							</ul>
							
							<p>If you have questions, comments, feature requests or bug reports please do get in contact so we can make this plugin better.</p>
						</div>
					</div> <!-- .postbox -->
				</div> <!-- .meta-box-sortables .ui-sortable -->
			</div> <!-- post-body-content -->
			
			<!-- sidebar -->
			<div id="postbox-container-1" class="postbox-container">
				<div class="meta-box-sortables">
					<div class="postbox">
						<h3 style="cursor:auto">Contribute</h3>
						<div class="inside">
							<p>Help improve this plugin by lodging bug reports and requesting features.</p>
							<ul>
								<li><a href="http://woopos.com.au/roadmap">Plugin Roadmap</a></li>
								<li><a href="https://github.com/kilbot/WooCommerce-POS">GitHub Repo</a></li>
				
							</ul>
						</div> <!-- .inside -->
					</div> <!-- .postbox -->
				</div> <!-- .meta-box-sortables -->	
				
			</div> <!-- #postbox-container-1 .postbox-container -->		
		
		</div> <!-- #post-body .metabox-holder .columns-2 -->

		<hr class="clear">

		<div class="debug">
			<h3>System Status</h3>
			<table class="widefat wc_status_table" cellspacing="0">
				<thead>
					<tr>
						<th>Check</th>
						<th>Result</th>
					</tr>
				</thead>
				<tbody>
<?php // check woocommerce 
if( version_compare( WC()->version, '2.1.0' ) >= 0 ) : ?>
					<tr><td class="row-title">WooCommerce Version</td><td><?php echo esc_html( WC()->version ); ?></td></tr>
<?php else: ?>
					<tr class="form-invalid"><td class="row-title">WooCommerce Version</td><td><strong><?php echo esc_html( WC()->version ); ?></td></tr>
<?php endif; 
// end check woocommerce ?>

<?php // check woocommerce api
$api_on = check_api_access();
$auth = check_api_authentication();
if( $api_on ): ?>
					<tr class="alternate"><td class="row-title">WooCommerce API</td><td>Enabled, says: <code style="font-size:0.8em"><?= $auth ? $auth : 'authentication error' ; ?> ...</code></td></tr>			
<?php else: ?>
					<tr class="alternate form-invalid"><td class="row-title">WooCommerce API</td><td>You need to enable the <a href="<?= admin_url('?page=wc-settings') ?>">WooCommerce REST API</a>.</td></tr>		
<?php endif;
// end check woocommerce api ?>

<?php // check permalinks 
global $wp_rewrite; if($wp_rewrite->permalink_structure != ''): ?>
					<tr><td class="row-title">Permalinks</td><td>Permalinks are enabled, nice!</td></tr>
<?php else: ?>
					<tr class="form-invalid"><td class="row-title">Permalinks</td><td><strong>WooCommerce POS</strong> requires <em>pretty</em> permalinks to work correctly. Please enable <a href="<?= admin_url('options-permalink.php') ?>">permalinks</a>.</td></tr>
<?php endif; 
// end check permalinks ?>

<?php // check variation orphans 
if( $orphans = find_orphans_variations() ): ?>
					<tr class="alternate form-invalid"><td class="row-title">Orphaned Variations</td><td>Some of your variations are orphaned :( ... the post ids of the orphans are: <code style="font-size:0.8em"><?= $orphans ?></code></td></tr>
<?php else: ?>
					<tr><td class="alternate row-title">Orphaned Variations</td><td>No orphans. That's a good thing.</td></tr>
<?php endif; 
// end check variation orphans  ?>

				</tbody>
			</table>
		</div>

		<br class="clear">

	</div> <!-- #poststuff -->
</div><!-- .wrap -->

