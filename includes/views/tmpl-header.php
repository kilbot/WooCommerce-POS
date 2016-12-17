<?php
  // using global user info
  global $current_user;
?>
<div>
  <a href="#" id="menu-btn"><i class="icon-bars"></i> <span><?php /* translators: wordpress */ _e( 'Menu' ); ?></span></a>
</div>
<h1 class="center-block">{{name}}</h1>
<div>
  <a href="#" data-toggle="dropdown">
    <?php echo get_avatar( $current_user->ID, 20 ); ?>
    <span><?php echo $current_user->display_name ?></span>
  </a>
  <div class="dropdown-list">
    <ul>
      <li><a href="<?php echo wp_logout_url( wc_pos_url() ); ?>"><?php /* translators: wordpress */ _e( 'Log Out' ); ?></a></li>
    </ul>
  </div>
</div>