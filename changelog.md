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

= 0.4.0 =
* Note: this is a major code refactor, almost every line of code has been rewritten
-
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
-
* Pro: Add customer during checkout
* Pro: Open multiple carts
* Pro: Hotkey for credit card readers
* Pro: New product page for quick product management
* Pro: New customer page for quick add/edit customers
* Pro: New order page
* Pro: New coupon page
* Pro: Multiple stores
* Pro: Compatibility fix for Stripe gateway
-
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

= 0.2.12 =
* Improved: Product list now uses local IndexedDB for fast searching and filtering. Fallback to server-side filtering for browsers which do not support [IndexedDB](http://caniuse.com/indexeddb)
* Improved: Cart logic now handled client-side, no more waiting for the server to respond
* New: Pagination info and last update time added to the product list
* New: Cart item price can now be changed
* New: Print receipt
* New: Added text domain, readying the plugin for translation

= 0.2.11 =
* Fix: Bug caused WC REST API authentication problems
* Fix: Bug caused no shipping fees for all users
* Tweak: Back to server side filtering until localstorage is complete

= 0.2.10 =
* New: Update cart quantity
* Tweak: Improvement to cart load time
* Tweak: Prevent New Order emails to admin
* Fix: No shipping fees on cart items

= 0.2.9 =
* Tweak: Improvement to cart add/remove products.
* New: Added some sanity check on the settings page.

= 0.2.6 =
* Tweak: Products now uses WC REST API for better performance. Tested on 300+ products. 

= 0.2.4 =
* Fix: Cart totals
* Fix: Notice about updating via github
* Fix: pagination weirdness

= 0.2 =
* Proof of concept