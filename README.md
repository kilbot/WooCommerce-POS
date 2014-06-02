# WooCommerce POS (beta) #
**Contributors:** kilbot  
**Tags:** woocommerce, pos, point-of-sale, vend, e-commerce  
**Requires at least:** 3.8  
**Tested up to:** 3.9  
**Stable tag:** 0.2.12  
**License:** GPLv2 or later  
**License URI:** http://www.gnu.org/licenses/gpl-2.0.html  

A simple front-end for taking WooCommerce orders at the Point of Sale.

## Description ##

Imagine [WooCommerce](http://www.woothemes.com/woocommerce/) and [Vend](http://www.vendhq.com/) had a baby. WooCommerce POS is a simple interface for taking orders using your WooCommerce store. No need to sync inventory between your online and bricks&mortar store, no need for monthly subscription fees.

### BETA ###
This plugin has only just been released and should **not** be used on a production site. A [roadmap for development](http://woopos.com.au/roadmap) is available on our website, please feel free to request features or ask questions in the comments. Bug reports can be made through the website or via the [GitHub repository](https://github.com/kilbot/WooCommerce-POS/issues).

* Roadmap: http://woopos.com.au/roadmap
* GitHub: https://github.com/kilbot/WooCommerce-POS/

### DEMO ###
You can see a demo of the WooCommerce POS plugin in action by going to [http://woopos.com.au/pos](http://woopos.com.au/pos) with `login/pass` : `demo/demo`

### REQUIREMENTS ###
WooCommerce POS uses IndexedDB to persist the product database on your computer or device. [IndexedDB](http://www.w3.org/TR/IndexedDB/) is currently a 'Candidate Recommendation' specification by the W3C and is not implemented by all browsers. To see if your browser is compatible please check [caniuse.com](http://caniuse.com/indexeddb).

If your browser does not support IndexedDB, WooCommerce POS will degrade to using the product database on your server via the WooCommerce REST API. The Point of Sale system will still function but searching and filtering will be slower. Some planned features for WooCommerce POS will also only be available for browsers that support IndexdedDB.

** For the best experience please use a modern browser such as [Chrome](http://www.google.com/chrome) or [Firefox](http://getfirefox.com) **

## Installation ##

### Automatic installation ###
1. Go to Plugins screen and select Add New.
2. Search for "WooCommerce POS" in the WordPress Plugin Directory.
3. Install the plugin
4. Click Activate Plugin to activate it.

### Manual installation ###
To install a WordPress Plugin manually:

1. Download the WooCommerce POS plugin to your desktop.
2. If downloaded as a zip archive, extract the Plugin folder to your desktop.
3. With your FTP program, upload the Plugin folder to the wp-content/plugins folder in your WordPress directory online.
4. Go to Plugins screen and find the newly uploaded Plugin in the list.
5. Click Activate Plugin to activate it.


## Frequently Asked Questions ##

### Where can I find more information on WooCommerce POS? ###
There is more information on our website at [woopos.com.au](http://woopos.com.au)

### Where can I report bugs? ###
Bugs can be reported on the [WooCommerce POS GitHub repository](https://github.com/kilbot/WooCommerce-POS).

## Screenshots ##

### 1. WooCommerce POS main screen ###
![WooCommerce POS main screen](http://s.wordpress.org/extend/plugins/woocommerce-pos-(beta)/screenshot-1.png)


## Changelog ##

### 0.2.13 ###
* Fix: Access to WC REST API now validates against the wordpress cookie, only logged in users with manage_woocommerce_pos capability can access the api
* Fix: Added flag for WC REST API request and response filters

### 0.2.12 ###
* Improved: Product list now uses local IndexedDB for fast searching and filtering. Fallback to server-side filtering for browsers which do not support [IndexedDB](http://caniuse.com/indexeddb)
* Improved: Cart logic now handled client-side, no more waiting for the server to respond
* New: Pagination info and last update time added to the product list
* New: Cart item price can now be changed
* New: Print receipt
* New: Added text domain, readying the plugin for translation

### 0.2.11 ###
* Fix: Bug caused WC REST API authentication problems
* Fix: Bug caused no shipping fees for all users
* Tweak: Back to server side filtering until localstorage is complete

### 0.2.10 ###
* New: Update cart quantity
* Tweak: Improvement to cart load time
* Tweak: Prevent New Order emails to admin
* Fix: No shipping fees on cart items

### 0.2.9 ###
* Tweak: Improvement to cart add/remove products.
* New: Added some sanity check on the settings page.

### 0.2.6 ###
* Tweak: Products now uses WC REST API for better performance. Tested on 300+ products. 

### 0.2.4 ###
* Fix: Cart totals
* Fix: Notice about updating via github
* Fix: pagination weirdness

### 0.2 ###
* Proof of concept

## Upgrade Notice ##

* Upgrade for the latest fixes