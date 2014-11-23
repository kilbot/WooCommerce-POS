<?php
/**
 * Template for the hotkeys settings
 */
?>

<script id="tmpl-wc-pos-settings-hotkeys" type="text/html">

	<h3><?php _e( 'Hotkeys', 'woocommerce-pos' ); ?></h3>

	<ul class="hotkeys">
		{{#each hotkeys}}
		<li>
			<input name="{{id}}" id="{{id}}" value="{{key}}" type="text">
			<label for="{{id}}">{{label}}</label>
		</li>
		{{/each}}
	</ul>

	<input class="button-primary" type="submit" value="<?php /* translators: wordpress */ echo esc_attr__( 'Save Changes' ); ?>" /><p class="response"></p>
	<input type="hidden" name="id" value="hotkeys" />

</script>