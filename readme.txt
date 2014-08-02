=== WooCommerce Point of Sale (POS) ===
Contributors: kilbot
Tags: cart, e-commerce, ecommerce, inventory, point-of-sale, pos, sales, sell, shop, shopify, store, vend, woocommerce,  wordpress-ecommerce
Requires at least: 3.8
Tested up to: 3.9
Stable tag: 0.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Finally, a Point of Sale plugin for WooCommerce! Sell online and in your physical retail store - no monthly fees, no need to sync inventory.

== Description ==

WooCommerce POS is a simple interface for taking orders at the Point of Sale using your [WooCommerce](http://www.woothemes.com/woocommerce/) store. WooCommerce POS provides an alternative to Vend or Shopify POS - no need to sync inventory and no monthly subscription fees.

= DEMO = 
You can see a demo of the WooCommerce POS plugin in action by going to [http://demo.woopos.com.au/pos](http://demo.woopos.com.au/pos) with `login/pass` : `demo/demo`

= MORE INFO = 
* Website: http://woopos.com.au
* Roadmap: http://woopos.com.au/roadmap
* GitHub: https://github.com/kilbot/WooCommerce-POS
* Translate: http://translate.woopos.com.au
* Upgrade to Pro: http://woopos.com.au/pro

= REQUIREMENTS =
* WooCommerce >= 2.1.0

WooCommerce POS uses IndexedDB to persist the product database on your computer or device. [IndexedDB](http://www.w3.org/TR/IndexedDB/) is currently a 'Candidate Recommendation' specification by the W3C and is not implemented by all browsers. To see if your browser is compatible please check [caniuse.com](http://caniuse.com/indexeddb).

If your browser does not support IndexedDB, WooCommerce POS will fallback to using the product database on your server via the WooCommerce REST API. The Point of Sale system will still function but searching and filtering will be slower. Some planned features for WooCommerce POS will also only be available for browsers that support IndexdedDB.

** For the best experience please use a modern browser such as [Chrome](http://www.google.com/chrome) **

== Installation ==

= Automatic installation = 
1. Go to Plugins screen and select Add New.
2. Search for "WooCommerce POS" in the WordPress Plugin Directory.
3. Install the plugin
4. Click Activate Plugin to activate it.

= Pro installation = 
If you have purchased a license for [WooCommerce POS Pro](http://woopos.com.au/pro) please follow the steps below to install and activate the plugin:

1. Go to: http://woopos.com.au/my-account/
2. Under My Downloads, click the download link and save the plugin to your desktop.
3. Then go to your site, login and go to the Add New Plugin page, eg: http://<yourstore.com>/wp-admin/plugin-install.php?tab=upload
4. Upload the plugin zip file from your desktop and activate.
5. Next, go to the POS Settings page and enter your License Key and License Email to complete the activation.

= Manual installation = 
To install a WordPress Plugin manually:

1. Download the WooCommerce POS plugin to your desktop.
2. If downloaded as a zip archive, extract the Plugin folder to your desktop.
3. With your FTP program, upload the Plugin folder to the wp-content/plugins folder in your WordPress directory online.
4. Go to Plugins screen and find the newly uploaded Plugin in the list.
5. Click Activate Plugin to activate it.

== Frequently Asked Questions ==

= Where can I find more information on WooCommerce POS? =
There is more information on our website at [woopos.com.au](http://woopos.com.au).
Try:
* [FAQ](http://woopos.com.au/faq)
* [Documentation](http://woopos.com.au/docs)
* [Blog](http://woopos.com.au/blog)

= Where can I request a feature? =
Visit the [Roadmap](http://woopos.com.au/roadmap) for information on what is coming in the next version of WooCommerce POS. If your feature isn't mentioned leave a request in the comments.

= Where can I get support? =
WooCommerce POS has a support page within the plugin (eg: http://*<yourstore>*/pos/support). If you are experiencing an error or problem please visit this support page and send a message using the form provided. This form will attach important information we need to assist you.

= Where can I report bugs? =
Bugs can be reported on the [WooCommerce POS GitHub repository](https://github.com/kilbot/WooCommerce-POS/issues).

== Screenshots ==

1. WooCommerce POS main screen

== Changelog ==

= 0.3.1 =
* New: choose which user roles have access to POS
* New: set products as visible to POS Only or Online Only
* New: filter products in WP-Admin by POS Only or Online Only
* New: filter orders in WP-Admin by POS or Online
* New: hierarchical UI for variable products, improves experience for products with large number of variations
* New: product filters, filter by category ( eg: cat:music ) or any attribute ( eg: in_stock:true )
* New: quick tabs for filtering products All, Featured ( featured:true ) and On Sale ( on_sale:true )
* New: Payment Gateway settings, enable POS only gateways and reorder through new settings tab
* TODO: Payment Gateway processing, experimental
* TODO: ui: change calculator
* TODO: ui: numpad module
* TODO: send order meta: user_id, payment_type
* TODO: look at this authentication issue with Super Cache
* TODO: test access to POS, multisite
* TODO: Add menu link directly to POS
* Improved: Most JS has been rewritten to improve performance and extensibility
* Improved: Initial download of products, improved performance for large stores and/or slow servers
* New: Greek translation thanks to Marios Polycarpou! [http://el.woopos.com.au/pos](http://el.woopos.com.au/pos)
* New: German translation thanks to Simon Potye! [http://de.woopos.com.au/pos](http://de.woopos.com.au/pos)
* Fix: Authenication no longer relies on cookies, should fix authentication issues for some users
* Fix: Bug preventing product display on Safari for subfolder installs of WordPress

* Pro Feature: Pro users can enable any Payment Gateway. (Upgrade to Pro)[http://woopos.com.au/pro].

= 0.3 =
* New: Set default POS customer on new settings page
* New: Add customer to order
* New: Documentation for third party developers [http://kilbot.github.io/WooCommerce-POS/](http://kilbot.github.io/WooCommerce-POS/)
* New: pt_BR translation thanks to Hermes Alves Dias Souza! [http://pt.woopos.com.au/pos](http://pt.woopos.com.au/pos)
* New: Icons for mobile devices. Thanks [@sixthcore](https://github.com/kilbot/WooCommerce-POS/issues/11)!
* Fix: stock is now synced after each order
* Fix: Add-to-cart bug for particular tax settings (tax enabled + prices exclusive from tax + no tax rates set)
* Fix: product display for sites where home_url != site_url
* Fix: authentication test for subfolder wordpress installs

= 0.2.15 =
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