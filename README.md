# WooCommerce POS #

Development repository for WooCommerce POS - the Point of Sale plugin for [WooCommerce](woothemes.com/woocommerce/).

* **Readme:** [https://github.com/kilbot/WooCommerce-POS/blob/master/readme.txt](https://github.com/kilbot/WooCommerce-POS/blob/master/readme.txt)
* **Download:** [http://wordpress.org/plugins/woocommerce-pos](http://wordpress.org/plugins/woocommerce-pos)
* **Demo:** [http://demo.woopos.com.au/pos](http://demo.woopos.com.au/pos)
* **Website:** [http://woopos.com.au](http://woopos.com.au)

## Report a bug ##

Please report all bugs [here](https://github.com/kilbot/WooCommerce-POS/issues) or contact support via [support@woopos.com.au](mailto:support@woopos.com.au)

## Thanks ##

Thanks to [Wordpress](http://wordpress.org) and [WooCommerce](http://woothemes.com/woocommerce/) for creating the best CMS & eCommerce platform on the planet.

## Changelog ##

### 0.3 ###
* New: Set default POS customer on new settings page
* New: Add customer to order
* New: Documentation for third party developers [http://kilbot.github.io/WooCommerce-POS/](http://kilbot.github.io/WooCommerce-POS/)
* New: pt_BR translation thanks to Hermes Alves Dias Souza! [http://pt.woopos.com.au/pos](http://pt.woopos.com.au/pos)
* New: Icons for mobile devices. Thanks [@sixthcore](https://github.com/kilbot/WooCommerce-POS/issues/11)!
* Fix: stock is now synced after each order
* Fix: Add-to-cart bug for particular tax settings (tax enabled + prices exclusive from tax + no tax rates set)
* Fix: product display for sites where home_url != site_url
* Fix: authentication test for subfolder wordpress installs

### 0.2.15 ###
* New: [website](http://woopos.com.au)!
* New: Multisite support: visit [http://demo.woopos.com.au/pos](http://demo.woopos.com.au/pos) to see WooCommerce POS in different languages using multisite
* New: nl_NL translation thanks to Egbert Jan! [http://nl.woopos.com.au/pos](http://nl.woopos.com.au/pos)
* New: nb_NO translation thanks to Olav Solvang! [http://no.woopos.com.au/pos](http://no.woopos.com.au/pos)
* Visit: [http://translate.woopos.com.au](http://translate.woopos.com.au) if you would like to translate WooCommerce POS into your language
* Improved: Search field now reset after successful barcode search
* Fix: Bug with multiple tax rates and compound tax rates
* Fix: WooCommerce POS will deactivate if WooCommerce not active, fixes https://github.com/kilbot/WooCommerce-POS/issues/9
* Fix: Added admin message if permalinks not active
* Fix: proper fix for rounding error for comma decimals
* Fix: fixed bug for subfolder wordpress install
* Removed: Beta tag!

### 0.2.14 ###
* New: Search by 'barcode'. Defaults to SKU for the moment. Instant add to cart for barcode matches, ie: barcode scanning!
* New: Support page: contact support directly from the POS
* New: Add order discount
* New: Add order note
* New: Void order
* New: Basic translations for nl_NL, fr_FR, es_ES and pt_BR. Corrections can be submitted to [GitHub](https://github.com/kilbot/WooCommerce-POS/issues) or via email [support@woopos.com.au](mailto:support@woopos.com.au). Thanks Javier Gómez for the Spanish translation!
* Fix: fixed bug for product_variations which effects WooCommerce < 2.1.7
* Fix: fixed rounding bug for comma decimals
* Fix: https://github.com/kilbot/WooCommerce-POS/issues/7