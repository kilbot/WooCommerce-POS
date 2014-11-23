<?php
/**
 * Template for the checkout
 */
?>

<script type="text/template" id="tmpl-wc-pos-help-modal">
	<div class="modal-header">
		<h1><?php _ex( 'Hotkeys', 'keyboard shortcuts', 'woocommerce-pos' ) ?></h1>
		<i class="icon icon-times close"></i>
	</div>

	<form class="modal-body">
		<ul class="hotkeys">
			{{#each hotkeys}}
			<li>
				<input name="{{id}}" id="{{id}}" value="{{key}}" type="text">
				<label for="{{id}}">{{label}}</label>
			</li>
			{{/each}}
		</ul>
	</form>

	<div class="modal-footer">
		<p class="response"></p>
		<button type="button" class="btn-primary save"><?php /* translators: wordpress */ _e( 'Save Changes' ); ?></button>
	</div>
</script>