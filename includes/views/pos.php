<?php
/**
 * Template for the POS
 */
?>

<script type="text/template" id="tmpl-pos">
	<section id="left-panel" class="col leftcol"></section>
	<section id="right-panel" class="col rightcol"></section>
</script>

<?php include 'pos/products.php'; ?>
<?php include 'pos/cart.php'; ?>
<?php //include 'pos/checkout.php'; ?>
<?php include 'pos/receipt.php'; ?>