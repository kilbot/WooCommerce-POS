<?php
/**
 * Template for the general settings
 */
?>

<h3><?= __( 'General Options', 'woocommerce-pos' ); ?></h3>

<table class="form-table">

	<tr valign="top">
		<th scope="row"><label for="">Example:</label></th>
		<td><input type="text" name="<?= $this->get_setting_name('example'); ?>" value="<?= $this->get_setting_value('example') ?>" /></td>
	</tr>

</table>