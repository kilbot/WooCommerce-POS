<div class="input-group">
  <div class="input-group-btn">
    <a class="btn btn-secondary" href="#" data-toggle="dropdown"><i class="icon-search"></i></a>
    <div class="dropdown-list">
      <ul>
        <li data-action="search"><i class="icon-search"></i> <?php /* translators: woocommerce */ _e( 'Search Products', 'woocommerce' ); ?></li>
        <li data-action="barcode"><i class="icon-barcode"></i> <?php _e( 'Scan Barcode', 'woocommerce-pos' ); ?></li>
      </ul>
    </div>
  </div>
  <input type="search" tabindex="1" class="form-control">
    <span class="input-group-addon clear">
    <i data-action="clear" class="icon-times-circle icon-lg"></i>
  </span>
  <span class="input-group-btn">
    <a class="btn btn-secondary" href="#" data-action="sync"><i class="icon-refresh"></i></a>
  </span>
</div>