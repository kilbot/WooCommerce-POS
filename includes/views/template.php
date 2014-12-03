<?php
/**
 * Main POS template
 */

// using global user info
global $current_user;

?>
<html class="no-js" <?php language_attributes(); ?>>
<head>
	<title><?php _e('Point of Sale', 'woocommerce-pos') ?> - <?php bloginfo('name') ?></title>
	<?php include 'meta.php' ?>
	<?php $this->head(); ?>
</head>
<body>

<div id="page" class="site">
	<header id="header">
		<div>
			<a href="#" id="menu-btn" class="btn-header"><i class="icon icon-bars"></i> <span><?php /* translators: wordpress */ _e( 'Menu' ); ?></span></a>
		</div>
		<h1 class="center-block"><?php $this->title(); ?></h1>
		<div>
			<div class="dropdown">
				<a href="#" id="user-btn" class="btn-header" data-toggle="dropdown">
					<?php echo get_avatar( $current_user->ID, 26 ); ?>
					<span><?php echo $current_user->display_name ?></span>
				</a>
				<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="dLabel">
					<li><a href="<?php echo wp_logout_url( home_url() ); ?>"><?php /* translators: wordpress */ _e( 'Log Out' ); ?></a></li>
				</ul>
			</div>
		</div>
	</header>
	<main id="main"></main>
</div>
<div id="menu">
	<ul>
		<?php $menu = $this->menu(); foreach( $menu as $key => $item ): ?>
		<li class="<?php echo $key ?>"><a href="<?php echo $item['href'] ?>"><i class="icon icon-<?php echo $key ?> icon-lg"></i><?php echo $item['label'] ?></a></li>
		<?php endforeach; ?>
	</ul>
</div>
<div id="modal"></div>

<?php $this->js_tmpl(); ?>
<?php $this->footer(); ?>

</body>
</html>