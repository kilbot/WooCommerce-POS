# [WooCommerce POS](http://woopos.com.au) 
[![Build Status](https://travis-ci.org/kilbot/WooCommerce-POS.svg)](https://travis-ci.org/kilbot/WooCommerce-POS) 
[![Code Climate](https://codeclimate.com/github/kilbot/WooCommerce-POS/badges/gpa.svg)](https://codeclimate.com/github/kilbot/WooCommerce-POS)
[![Dependency Status](https://david-dm.org/kilbot/WooCommerce-POS.svg)](https://david-dm.org/kilbot/WooCommerce-POS)

Development repository for WooCommerce POS - the Point of Sale plugin for [WooCommerce](http://woothemes.com/woocommerce/).

* **Download:** [http://wordpress.org/plugins/woocommerce-pos](http://wordpress.org/plugins/woocommerce-pos)
* **Demo:** [http://demo.woopos.com.au/pos](http://demo.woopos.com.au/pos)
* **Website:** [http://woopos.com.au](http://woopos.com.au)

<p align="center">
  <img src="https://woopos.com.au/wp-content/uploads/2015/05/pos-sale-lg.gif" alt="Screenshot"/>
</p>

## Browser Compatibility

<p align="center">
  <img src="https://woopos.com.au/wp-content/uploads/2015/05/compatibility-chart.jpg" alt="Browser Compatibility"/>
</p>

Browser testing by [BrowserStack](http://browserstack.com).

## Report a bug

Please report all bugs [here](https://github.com/kilbot/WooCommerce-POS/issues) or contact support via [support@woopos.com.au](mailto:support@woopos.com.au)

## Translations

If you would like to help translate WooCommerce POS into your language please check out the [WooCommerce POS Language Packs](https://github.com/kilbot/WooCommerce-POS-Language-Packs) repository.

## Developing locally

WooCommerce POS is a WordPress plugin which requires [WordPress](http://wordpress.org) 3.8+ and [WooCommerce](wordpress.org/plugins/woocommerce) 2.2+.

To develop the plugin locally you will first have to set up a local server with WordPress and WooCommerce installed.
If this is your first time setting up a local development environment you may want to check out [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV) or [Chassis](https://github.com/Chassis/Chassis).

### Installation

Navigate to your local `wp-content/plugins` directory and clone the project. 
The recursive flag will init and update any submodules. 

```sh
git clone --recursive https://github.com/kilbot/WooCommerce-POS.git woocommerce-pos
```

Then, navigate into the root directory of the project and install the dependencies.

```sh
cd woocommerce-pos && npm install
```

### Building the project

Once you have installed the project you will have all the files necessary to build and customise the plugin. Build tasks are automated by [Grunt](http://gruntjs.com).

```sh
grunt dev
```

To create a minified version of the project ready to deploy, use:

```sh
grunt deploy
```

This will create a zip archive of the plugin which you can then install via your WordPress admin.