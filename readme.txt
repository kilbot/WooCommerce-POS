=== WooCommerce POS (beta) ===
Contributors: kilbot
Tags: woocommerce, pos, point-of-sale, vend, e-commerce
Requires at least: 3.8
Tested up to: 3.9
Stable tag: 0.2.14
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A simple front-end for taking WooCommerce orders at the Point of Sale.

== Description ==

Imagine [WooCommerce](http://www.woothemes.com/woocommerce/) and [Vend](http://www.vendhq.com/) had a baby. WooCommerce POS is a simple interface for taking orders using your WooCommerce store. No need to sync inventory between your online and bricks&mortar store, no need for monthly subscription fees.

= BETA =
This plugin has only just been released and should **not** be used on a production site. A [roadmap for development](http://woopos.com.au/roadmap) is available on our website, please feel free to request features or ask questions in the comments. Bug reports can be made through the website or via the [GitHub repository](https://github.com/kilbot/WooCommerce-POS/issues).

* Roadmap: http://woopos.com.au/roadmap
* GitHub: https://github.com/kilbot/WooCommerce-POS/

= DEMO = 
You can see a demo of the WooCommerce POS plugin in action by going to [http://demo.woopos.com.au/pos](http://demo.woopos.com.au/pos) with `login/pass` : `demo/demo`

= REQUIREMENTS =
WooCommerce POS uses IndexedDB to persist the product database on your computer or device. [IndexedDB](http://www.w3.org/TR/IndexedDB/) is currently a 'Candidate Recommendation' specification by the W3C and is not implemented by all browsers. To see if your browser is compatible please check [caniuse.com](http://caniuse.com/indexeddb).

If your browser does not support IndexedDB, WooCommerce POS will fallback to using the product database on your server via the WooCommerce REST API. The Point of Sale system will still function but searching and filtering will be slower. Some planned features for WooCommerce POS will also only be available for browsers that support IndexdedDB.

** For the best experience please use a modern browser such as [Chrome](http://www.google.com/chrome) **

== Installation ==

= Automatic installation = 
1. Go to Plugins screen and select Add New.
2. Search for "WooCommerce POS" in the WordPress Plugin Directory.
3. Install the plugin
4. Click Activate Plugin to activate it.

= Manual installation = 
To install a WordPress Plugin manually:

1. Download the WooCommerce POS plugin to your desktop.
2. If downloaded as a zip archive, extract the Plugin folder to your desktop.
3. With your FTP program, upload the Plugin folder to the wp-content/plugins folder in your WordPress directory online.
4. Go to Plugins screen and find the newly uploaded Plugin in the list.
5. Click Activate Plugin to activate it.


== Frequently Asked Questions ==

= Where can I find more information on WooCommerce POS? =
There is more information on our website at [woopos.com.au](http://woopos.com.au)

= Where can I report bugs? =
Bugs can be reported on the [WooCommerce POS GitHub repository](https://github.com/kilbot/WooCommerce-POS/issues).

== Screenshots ==

1. WooCommerce POS main screen

== Changelog ==

= 0.2.15 =
* New: Multisite support: visit [http://demo.woopos.com.au/pos](http://demo.woopos.com.au/pos) to see WooCommerce POS in different languages using multisite
* Improved: nl_NL translation thanks to Egbert Jan! Visit [http://translate.woopos.com.au](http://translate.woopos.com.au) if you would like to translate WooCommerce POS into your language
* Fix: fixed bug for subfolder wordpress install

= 0.2.14 =
* New: Search by 'barcode'. Defaults to SKU for the moment. Instant add to cart for barcode matches, ie: barcode scanning!
* New: Support page: contact support directly from the POS
* New: Add order discount
* New: Add order note
* New: Void order
* New: Basic translations for nl_NL, fr_FR, es_ES and pt_BR. Corrections can be submitted to [GitHub](https://github.com/kilbot/WooCommerce-POS/issues) or via email [support@woopos.com.au](mailto:support@woopos.com.au). Thanks Javier Gómez for the Spanish translation!
* Fix: fixed bug for product_variations which effects WooCommerce < 2.1.7
* Fix: fixed rounding bug for comma decimals
* Fix: https://github.com/kilbot/WooCommerce-POS/issues/7

= 0.2.13 =
* Improved: Product Sync now handled by web worker, improves sync performance for large stores (1000+ products)
* Fix: Access to WC REST API now validates against the wordpress cookie, only logged in users with manage_woocommerce_pos capability can access the api
* Fix: Added flag for WC REST API request and response filters
* Fix: Cart now handles comma decimals correctly