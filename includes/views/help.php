<?php
/**
 * Template for the checkout
 */
?>

<script type="text/template" id="tmpl-wc-pos-help-modal" data-title="<?php _ex( 'Hotkeys', 'keyboard shortcuts', 'woocommerce-pos' ) ?>">
	<ul class="hotkeys">
		{{#each hotkeys}}
		<li>
			<input name="{{id}}" id="{{id}}" value="{{key}}" type="text">
			<label for="{{id}}">{{label}}</label>
		</li>
		{{/each}}
	</ul>
</script>