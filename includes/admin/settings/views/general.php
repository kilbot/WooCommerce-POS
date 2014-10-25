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

	<tr valign="top">
		<th scope="row"><label for="">Checkbox:</label></th>
		<td><input type="checkbox" name="<?= $this->get_setting_name('checkbox'); ?>" value="<?= $this->get_setting_value('checkbox') ?>" /></td>
	</tr>

	<tr valign="top">
		<th scope="row"><label for="">Select:</label></th>
		<td>
			<select name="<?= $this->get_setting_name( 'select' ); ?>" class="select2">
				<option value="888">Option 1</option>
				<option value="999">Option 2</option>
				<option value="000">Option 3</option>
			</select>
		</td>
	</tr>

</table>