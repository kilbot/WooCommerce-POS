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

	<div id="blat"></div>

	<script id='tmpl-wc-pos-settings-layout' type='text/html'>
		<section>
			<nav id="wc-pos-settings-tabs">
				<ul><li>hi</li></ul>
			</nav>
			<div id="wc-pos-settings"></div>
		</section>
	</script>

	<script id="tmpl-wc-pos-settings-general" type="text/html">
		<tr>
			<td><%= label %></td>
			<td><input type="text" /></td>
		</tr>
	</script>

</div>