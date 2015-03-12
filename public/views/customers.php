<?php
/**
 * Template for customers
 */
?>

<script type="text/template" id="tmpl-customers-layout">
  <div class="container">
    <div id="customers-header"></div>
    <div id="customers"></div>
    <div id="customers-footer" class="text-center"></div>
  </div>
</script>

<script type="text/x-handlebars-template" id="tmpl-customer">
  <td class="name"><strong><a class="edit-customer">{{name}}</a></strong></td>
  <td class="name">{{email}}</td>
</script>

<script type="text/template" id="tmpl-customers-empty">
  <div class="empty"><?php _e( 'No customers found', 'woocommerce-pos' ); ?></div>
</script>

<script type="text/template" id="tmpl-customers-header">
  <h3>Customers</h3>
</script>

<script type="text/template" id="tmpl-customers-table">
  <table class="table">
    <thead>
      <tr>
        <th>Customer</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
  <hr>
</script>

<script type="text/x-handlebars-template" id="tmpl-customer-edit">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>{{name}}</h4>
    </div>
    <div class="panel-body">
      <form>
        <input type="hidden" id="customer_id" value="{{ID}}">
        <div class="form-group">
          <label for="name">Name</label>
          <input class="form-control" type="text" id="customer_name" value="{{name}}">
        </div>
        <div class="form-group">
          <label for="username">Username</label>
          <input class="form-control" type="text" id="customer_username" value="{{username}}">
        </div>
        <div class="form-group">
          <label for="first_name">First Name</label>
          <input class="form-control" type="text" id="customer_first_name" value="{{first_name}}">
        </div>
        <div class="form-group">
          <label for="last_name">Last Name</label>
          <input class="form-control" type="text" id="customer_last_name" value="{{last_name}}">
        </div>
        <div class="form-group">
          <label for="nickname">Nickname</label>
          <input class="form-control" type="text" id="customer_nickname" value="{{nickname}}">
        </div>
        <div class="form-group">
          <label for="URL">URL</Label>
          <input class="form-control" type="text" id="customer_URL" value="{{URL}}">
        </div>
        <div class="form-group">
          <label for="avatar">Avatar</label>
          <input class="form-control" type="text" id="customer_avatar" value="{{avatar}}">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input class="form-control" type="text" id="customer_email" value="{{email}}">
        </div>
        <button type="submit" class="btn btn-success submit-customer">Save</button>
        <a class="btn btn-default close-customer">Close</a>
      </form>
    </div>
  </div>
</script>

<script type="text/template" id="tmpl-customer-footer-edit">asdfasdfasdfasdf
</script>

<script type="text/template" id="tmpl-customers-footer">
  <form class="form-inline"><?php _e( 'Add new', 'woocommerce-pos' ); ?>: <input type="text" id="add-customer-name" class="form-control" placeholder="Name"><input type="email" id="add-customer-email" class="form-control" placeholder="Email"><a class="btn btn-primary action-add-customer" id="add-customer"><?php _e( 'Add', 'woocommerce-pos' ); ?></a></form>
</script>