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
    {{#if pass}}
      <td class="pass" style="width:10%"><i class="icon-check"></i></td>
    {{else}}
      <td class="fail" style="width:10%"><i class="icon-times"></i></td>
    {{/if}}
    <td>
      {{{message}}}
      {{#if action}}
        <a href="{{action}}" class="button">{{prompt}}</a>
      {{/if}}
    </td>
  </tr>
  {{/each}}
  </tbody>
</table>