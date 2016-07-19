<small class="info">
  <?= sprintf( __( 'Showing %s of %s', 'woocommerce-pos' ), '{{showing}}', '{{local}}' ); ?>
  {{#if hasQueue}}(<?= sprintf( __( '%s in queue', 'woocommerce-pos' ), '{{queue}}' ); ?>){{/if}}
</small>