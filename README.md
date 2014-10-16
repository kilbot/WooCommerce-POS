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

### 0.3.4 ###
* Urgent Fix: performance issue downloading products
* Fix: potential clash for admin menu position
* Fix: bug affecting woocommerce_api_order_response
* Fix: cashback entry on receipt
* Improved: POS Only products

### 0.3.3 ###
* Urgent Fix: Compatibility with new order-status introduced in WooCommerce > 2.2
* Fix: POS Only products improved, fixes 404 errors on imported products
* Fix: IndexedDB now available on Safari 7.1, compatibility update to db
* Fix: bug effecting default customer setting
* Fix: added support for Simplify Commerce by Mastercard
* Improved: product thumbnails, support for non-cropped thumbs
* Improved: clearing local database improved for large stores

### 0.3.2 ###
* Urgent Fix: POS bug causing problems with product display on some websites, eg: featured products
* Fix: refresh button on offsite payment receipts
* Fix: managing_stock for variations

### 0.3.1 ###
* [read blog post](http://woopos.com.au/2014/08/version-0-3-1-released/)
* New: choose which user roles have access to POS
* New: set products as visible to [POS Only](http://woopos.com.au/docs/pos-only-products/) or Online Only
* New: filter products in WP-Admin by POS Only or Online Only
* New: filter orders in WP-Admin by POS or Online
* New: hierarchical UI for variable products, improves experience for products with large number of variations
* New: [product filters](http://woopos.com.au/docs/product-searching-filtering/), filter by category ( eg: cat:music ) or any attribute ( eg: in_stock:true )
* New: quick tabs for filtering products All, Featured ( featured:true ) and On Sale ( on_sale:true )
* New: [number pad](http://woopos.com.au/docs/number-pads/) for quick entry via mouse or touch
* New: Payment Gateway settings, enable POS only gateways and reorder through new settings tab
* New: Payment Gateway processing (tested on some gateways but still experimental)
* New: change calculated for Cash sales
* New: cashback option for Card sales
* New: Link to POS from admin menu (sorry!)
* New: [Debug flag](http://woopos.com.au/docs/debugging/) for Javascript console logging
* New: Greek translation thanks to Marios Polycarpou! [http://el.woopos.com.au/pos](http://el.woopos.com.au/pos)
* New: German translation thanks to Simon Potye! [http://de.woopos.com.au/pos](http://de.woopos.com.au/pos)
* New: Danish translation thanks to Thomas Clausen! [http://da.woopos.com.au/pos](http://da.woopos.com.au/pos)
* Improved: Most JS has been rewritten to improve performance and extensibility
* Improved: Initial download of products, improved performance for large stores and/or slow servers
* Improved: Notes are now handled like Customer Notes for display on receipts
* Fix: Authenication no longer relies on cookies, should fix authentication issues for some users
* Fix: Bug preventing product display on Safari for subfolder installs of WordPress
* Fix: Bug effecting admin settings for translation users

* Pro Feature: Pro users can enable any Payment Gateway. [Upgrade to Pro](http://woopos.com.au/pro)

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