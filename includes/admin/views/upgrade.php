<?php
/**
 * View for the Upgrade page
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.kilbot.com.au
 */
?>

<!-- temporary inline css, todo: remove this -->
<style type="text/css">
  .web-title {
    display: none;
  }
  .blurb {
    font-size: 14px;
    line-height: 1.6em;
  }
  .widget-area {
    float: right;
    width: 33%;
    margin-left: 20px;
    text-align: center;
    margin-bottom: 20px;
  }
  .widget-area .btn {
    display: inline-block;
    margin-bottom: 0;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    background-image: none;
    border: 1px solid transparent;
    white-space: nowrap;
    text-decoration: none;
    margin: 20px 0;
  }
  .widget-area .btn-primary {
    color: #fff;
    background-color: #cd2f19;
    border-color: #b62a16;
  }
  .widget-area .btn-lg {
    padding: 10px 16px;
    font-size: 18px;
    line-height: 1.33;
    border-radius: 6px;
  }
  .comparison-table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    border: 1px solid #e5e5e5;
    box-shadow: 0 1px 1px rgba(0,0,0,0.04);
    background-color: #f5f5f5;
  }
  .comparison-table thead {
    font-size: 18px;
  }
  .comparison-table thead tr {
    border-bottom: 1px solid #e5e5e5;
  }
  .comparison-table thead th {
    width: 33%;
    font-weight: normal;
  }
  .comparison-table thead th:first-of-type {
    background-color: #B0B0B0;
    color: #f5f5f5;
  }
  .comparison-table thead th:last-of-type {
    background-color: #d54e21;
    color: #f5f5f5;
  }
  .comparison-table th, td {
    padding: 1% 2%;
  }
  .comparison-table tbody th {
    font-weight: normal;
    text-align: right;
  }
  .comparison-table tbody tr {
    border-bottom: 1px solid #e5e5e5;
  }
  .comparison-table tbody tr td:first-of-type {
    background-color: #fafafa;
  }
  .comparison-table tbody tr td:last-of-type {
    background-color: #fef7f1;
  }
  .comparison-table .fa {
    font-family: Dashicons !important;;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .comparison-table .fa-check:before {
    content: "\f147";
    color: #3c763d;
    font-size: 24px;
  }
  .comparison-table .fa-times:before {
    content: "\f335";
    color: #a94442;
    font-size: 24px;
  }
</style>

<div class="wrap clear woocommerce-pos-upgrade">

  <!--
  Little trick to get around WP js injection of admin notices
  WP js looks for first h2 in .wrap and appends notices, so we'll make the first one hidden
  https://github.com/WordPress/WordPress/blob/master/wp-admin/js/common.js
  -->
  <h2 style="display:none"></h2>

  <h2 style="margin:20px 0;">Thank you for using WooCommerce POS!</h2>

  <?php echo $upgrade ?>

</div>