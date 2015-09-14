<?php foreach( $this->menu() as $key => $item ): ?>
  <li class="<?php echo $key ?>"><a href="<?php echo $item['href'] ?>"><i class="icon-<?php echo $key ?> icon-lg"></i><?php echo $item['label'] ?></a></li>
<?php endforeach; ?>