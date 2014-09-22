=== WooCommerce Point of Sale (POS) ===
Contributors: kilbot
Tags: cart, e-commerce, ecommerce, inventory, point-of-sale, pos, sales, sell, shop, shopify, store, vend, woocommerce,  wordpress-ecommerce
Requires at least: 3.8 & WooCommerce 2.1
Tested up to: 4.0
Stable tag: 0.3.2
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

= 0.3.3 =
* TODO: add Cash and Card to order drop down
* TODO: custom barcode field
* TODO: fix customer serach for network blogs
* TODO: coupons?
* TODO: change way database is deleted
* TODO: fix product attribute display
* TODO: https support
* TODO: Safari variations broken?
* TODO: non variable attributes??
* TODO: WooCommerce 2.2 compatibility order status
* TODO: check email template, customer name
* Fix: bug effecting default customer setting

= 0.3.2 =
* Urgent Fix: POS bug causing problems with product display on some websites, eg: featured products
* Fix: refresh button on offsite payment receipts
* Fix: managing_stock for variations

= 0.3.1 =
* [read blog post](http://woopos.com.au/2014/08/version-0-3-1-released/)
* New: choose which user roles have access to POS
* New: set products as visible to POS Only or Online Only
* New: filter products in WP-Admin by POS Only or Online Only
* New: filter orders in WP-Admin by POS or Online
* New: hierarchical UI for variable products, improves experience for products with large number of variations
* New: product filters, filter by category ( eg: cat:music ) or any attribute ( eg: in_stock:true )
* New: quick tabs for filtering products All, Featured ( featured:true ) and On Sale ( on_sale:true )
* New: number pad for quick entry via mouse or touch
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