<?php

namespace WC_POS\Unit_Tests;

use WP_UnitTestCase;

class WC_Functions extends WP_UnitTestCase {

  public function test_wc_round_tax_total() {
    // Issue suggests this should be 22.34
    // https://github.com/kilbot/WooCommerce-POS/issues/79
    $this->assertEquals( 22.35, wc_round_tax_total( 22.345 ) );
  }

  public function test_wc_format_decimal(){
    $this->assertEquals( 22.35, wc_format_decimal( 22.345, 2 ) );
  }

}