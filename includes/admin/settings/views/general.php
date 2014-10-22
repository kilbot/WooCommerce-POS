<?php
/**
 * Template for the general settings
 */
?>

<h3><?= __( 'General Options', 'woocommerce-pos' ); ?></h3>

<table class="form-table">

	<tr valign="top">
		<th scope="row"><label for="">Example:</label></th>
		<td><input name="<?= $this->get_option_key('example'); ?>" type="text" value="<?= $this->get_option_data('example') ?>" /></td>
	</tr>

	<tr valign="top">
		<th scope="row"><?= __( 'Grant POS Access', 'woocommerce-pos' ); ?></th>
		<td><input name="<?= $this->get_option_key('example2'); ?>" type="text" value="<?= $this->get_option_data('example2') ?>" /></td>
	</tr>

</table>