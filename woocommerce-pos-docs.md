WooCommerce POS Documentation
=============================

# Introduction

WooCommerce POS provides hooks for third-party developers to extend the functionality of the core plugin. WooCommerce POS is in it's very early stages of development so the code (and this document) are subject to rapid change often without notice. If you wish to develop a plugin using these docs, please contact me via [support@woopos.com.au](support@woopos.com.au) so I can keep you in the loop.

Good luck!

[@kilbot](http://github.com/kilbot)

# Hooks

If you are familiar with the use of hooks in WordPress and WooCommerce you should have no problem understanding this document. If you don't know what a hook is you should [read this](http://codex.wordpress.org/Plugin_API) and get comfortable with hooks before you continue.

## Admin Settings

# woocommerce_pos_settings_tabs_array

You can add a tab to the admin settings page by using the `woocommerce_pos_settings_tabs_array` filter. Also, by extending the [`WC_POS_Settings_Page`](https://github.com/kilbot/WooCommerce-POS/blob/master/admin/includes/class-pos-settings.php) class you can make use of the default methods such as `add_settings_page`, `output` and `save`.

``` php
add_action( 'some_hook' );
```

Contact
----------------

 * [Github @kilbot](http://github.com/kilbot)
 * [Twitter @kilbot](http://twitter.com/kilbot)
 * [woopos.com.au](http://woopos.com.au)
