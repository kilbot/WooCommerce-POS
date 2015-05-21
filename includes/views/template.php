<?php
/**
 * Main POS template
 */

// using global user info
global $current_user;

?>
<html class="no-js">
<head>
  <title><?php _e('Point of Sale', 'woocommerce-pos') ?> - <?php bloginfo('name') ?></title>
  <?php include 'meta.php' ?>
  <?php $this->head(); ?>
</head>
<body>

<div id="page" class="site"></div>

<script type="text/template" id="tmpl-header">
  <div>
    <a href="#" id="menu-btn" class="btn-header"><i class="icon-bars"></i> <span><?php /* translators: wordpress */ _e( 'Menu' ); ?></span></a>
  </div>
  <h1 class="center-block"><?php $this->title(); ?></h1>
  <div>
    <div class="dropdown">
      <a href="#" id="user-btn" class="btn-header" data-toggle="dropdown">
        <?php echo get_avatar( $current_user->ID, 26 ); ?>
        <span><?php echo $current_user->display_name ?></span>
      </a>
      <ul class="dropdown-menu dropdown-menu-right" role="menu">
        <li><a href="<?php echo wp_logout_url( home_url() ); ?>"><?php /* translators: wordpress */ _e( 'Log Out' ); ?></a></li>
      </ul>
    </div>
  </div>
</script>

<script type="text/template" id="tmpl-menu">
  <?php $menu = $this->menu(); foreach( $menu as $key => $item ): ?>
    <li class="<?php echo $key ?>"><a href="<?php echo $item['href'] ?>"><i class="icon-<?php echo $key ?> icon-lg"></i><?php echo $item['label'] ?></a></li>
  <?php endforeach; ?>
</script>

<?php $this->js_tmpl(); ?>
<?php $this->print_tmpl(); ?>
<?php $this->footer(); ?>

</body>
</html>