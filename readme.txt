=== WooCommerce POS ===
Contributors: kilbot
Tags: cart, e-commerce, ecommerce, inventory, point-of-sale, pos, sales, sell, shop, shopify, store, vend, woocommerce,  wordpress-ecommerce
Requires at least: 4.0 & WooCommerce 2.3
Tested up to: 4.2.2
Stable tag: 0.4.1
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
* WooCommerce >= 2.3.0
* [A modern browser](http://woopos.com.au/faq/browser-compatibility/)

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
WooCommerce POS has a support page within the plugin (eg: http://*<yourstore>*/pos/#support). If you are experiencing an error or problem please visit this support page and send a message using the form provided. This form will attach important information we need to assist you.

= Where can I report bugs? =
Bugs can be reported on the [WooCommerce POS GitHub repository](https://github.com/kilbot/WooCommerce-POS/issues).

== Screenshots ==

1. WooCommerce POS main screen

== Changelog ==

= 0.4.2 =
* New: local storage will now clear on version change - commit [85ec411](https://github.com/kilbot/WooCommerce-POS/commit/85ec411a58600988b811272be6d151cb11161f4f)
* New: option to automatically print receipt after checkout - commit [16fba05](https://github.com/kilbot/WooCommerce-POS/commit/16fba054593e118be6c567ce4d87f8d0b91acaa5)
* New: add cashier to receipt data - commit []()
* Fix: variation display and select issues - commit [91c7ec1](https://github.com/kilbot/WooCommerce-POS/commit/91c7ec13e737f820d84feb7890d7b6d027a79792), [b3d6543](https://github.com/kilbot/WooCommerce-POS/commit/b3d6543b86140df62ff90f3a7b7e734d73ae59ab)
* Fix: variation barcode search for products in queue - commit [3fda531](https://github.com/kilbot/WooCommerce-POS/commit/3fda5317ef580f6b6d70e24ba235d2b7e69c5ee4)
* Fix: variation stock adjustment after sale - commit [26978fd](https://github.com/kilbot/WooCommerce-POS/commit/26978fd0e74cfb9cf28ef2bb4bc5222820a77d38)
* Fix: populate order addresses from customer id - commit [b86bc56](https://github.com/kilbot/WooCommerce-POS/commit/b86bc5650a2bf41d7744bf07cda34407e8fa3dd5)
* Fix: compatibility fix for WC 2.4 SSL authentication - commit [525671b](https://github.com/kilbot/WooCommerce-POS/commit/525671b7613b20864366aebf426f14d07b37bfa4)
* Fix: modal CSS conflict in WP Admin - commit [837b918](https://github.com/kilbot/WooCommerce-POS/commit/837b918e5bae4de6c1cee1492d390ade1b2e7f45)
* Fix: numpad discount bug introduced in 0.4.1
* Tweak: WP Admin CSS - commit [c5a38c7](https://github.com/kilbot/WooCommerce-POS/commit/c5a38c7f889a7788e3eaa633c28620d2e80ac2ee)

= 0.4.1 =
* Note: WooCommerce POS now requires WooCommerce 2.3 or greater
* New: added woocommerce_pos_email_receipt hook
* Improve: blur() barcode search field after successful match
* Improve: editing a product/fee/shipping title in cart - commit [216e8a5](https://github.com/kilbot/WooCommerce-POS/commit/216e8a5)
* Improve: css tweaks for Firefox - commit [216e8a5](https://github.com/kilbot/WooCommerce-POS/commit/216e8a5)
* Improve: keyboard entry for qty and prices - commit [ee61744](https://github.com/kilbot/WooCommerce-POS/commit/ee61744)
* Improve: variation attributes now stored as line item meta for display on receipts
* Fix: support for legacy server HTTP methods - commit [5765491](https://github.com/kilbot/WooCommerce-POS/commit/5765491)
* Fix: Internal Server Error for PHP 5.2.x - commit [d800d40](https://github.com/kilbot/WooCommerce-POS/commit/d800d40)
* Fix: parse $HTTP_RAW_POST_DATA global to array - commit [ac88f50](https://github.com/kilbot/WooCommerce-POS/commit/ac88f50)
* Fix: decimal quantity display - commit [358d95f](https://github.com/kilbot/WooCommerce-POS/commit/358d95f)
* Fix: check WooCommerce has loaded - commit [80285c4](https://github.com/kilbot/WooCommerce-POS/commit/80285c4)
* Fix: variation selection issues in popover - commit [5c9673b](https://github.com/kilbot/WooCommerce-POS/commit/5c9673b)
* Fix: incorrect total tax calculation for negative fees - issue [#85](https://github.com/kilbot/WooCommerce-POS/issues/85)
* Fix: decimal bug on numpad entry, eg: 0.01 - commit [b46884d](https://github.com/kilbot/WooCommerce-POS/commit/b46884d)
* Update npm dependencies

= 0.4 =
* ** Note: this is a major code refactor, almost every line of code has been rewritten **
* ** Please check your POS admin after upgrade as many settings have changed **

* Products: Variation popover/drawer
* Products: Infinite scroll
* Products: Hotkey for barcode search
* Products: Attributes now show in tooltip
* Cart: Tax settings can now be changed per cart item
* Cart: Meta data can be added to cart items
* Cart: Ability to add shipping line item
* Cart: Ability to fee line item
* Hotkeys: Use hotkey '?' to display a list of available hotkeys
* Translations: WooCommerce POS now uses automatic downloads
* New: Set custom permalink for POS front-end
* Improved: Responsive design for tablets & mobile

* Pro: Add customer during checkout
* Pro: Open multiple carts
* Pro: Hotkey for credit card readers
* Pro: New product page for quick product management
* Pro: New customer page for quick add/edit customers
* Pro: New order page
* Pro: New coupon page
* Pro: Multiple stores
* Pro: Compatibility fix for Stripe gateway

* Fix: all the things

= 0.3.5 =
* Note: this is a minor compatibility update for WooCommerce 2.3
* Fix WC_Gateway_Mijireh error with WC 2.3
* Fix for W3 Total Cache minify js conflict
* Fix capitalization bug with product searches

= 0.3.4 =
* Urgent Fix: performance issue downloading products
* Fix: potential clash for admin menu position
* Fix: bug affecting woocommerce_api_order_response
* Fix: cashback entry on receipt
* Improved: POS Only products

= 0.3.3 =
* Urgent Fix: Compatibility with new order-status introduced in WooCommerce > 2.2
* Fix: POS Only products improved, fixes 404 errors on imported products
* Fix: IndexedDB now available on Safari 7.1, compatibility update to db
* Fix: bug effecting default customer setting
* Fix: added support for Simplify Commerce by Mastercard
* Improved: product thumbnails, support for non-cropped thumbs
* Improved: clearing local database improved for large stores

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