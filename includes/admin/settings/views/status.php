<?php
/**
 * Template for the admin tools
 */
?>

<h3><?php /* translators: woocommerce */ _e( 'System Status', 'woocommerce' ); ?></h3>

<table class="widefat striped">
  <tbody>

  {{#each []}}
  <tr>
    <th style="width:25%">{{title}}</th>
    <td style="width:10%;text-align:center;"><i class="icon-{{#if pass}}success{{else}}error{{/if}} icon-lg"></i></td>
    <td>
      {{{message}}}
      {{#each buttons}}
        <a href="{{#if href}}{{href}}{{else}}#{{/if}}" {{#if action}}data-action="{{action}}"{{/if}} class="button">{{prompt}}</a>
      {{/each}}
    </td>
  </tr>
  {{/each}}
  </tbody>
</table>