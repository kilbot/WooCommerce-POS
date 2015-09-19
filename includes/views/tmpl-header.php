<?php
  // using global user info
  global $current_user;
?>
<div>
  <a href="#" id="menu-btn" class="btn-header"><i class="icon-bars"></i> <span><?php /* translators: wordpress */ _e( 'Menu' ); ?></span></a>
</div>
<h1 class="center-block">{{name}}</h1>
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