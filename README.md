<p align="center">
  <a href="https://github.com/wcpos"><img src="archive-notice.svg" alt=""/></a>
</p>

# [WooCommerce POS](http://wcpos.com) 
[![Build Status](https://travis-ci.org/kilbot/WooCommerce-POS.svg)](https://travis-ci.org/kilbot/WooCommerce-POS) 
[![Code Climate](https://codeclimate.com/github/kilbot/WooCommerce-POS/badges/gpa.svg)](https://codeclimate.com/github/kilbot/WooCommerce-POS)
[![Coverage Status](https://coveralls.io/repos/kilbot/WooCommerce-POS/badge.svg)](https://coveralls.io/r/kilbot/WooCommerce-POS)
[![Dependency Status](https://david-dm.org/kilbot/WooCommerce-POS.svg)](https://david-dm.org/kilbot/WooCommerce-POS)
[![Join the chat at https://gitter.im/kilbot/WooCommerce-POS](https://badges.gitter.im/kilbot/WooCommerce-POS.svg)](https://gitter.im/kilbot/WooCommerce-POS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Development repository for WooCommerce POS - the Point of Sale plugin for [WooCommerce](http://woothemes.com/woocommerce/).

* **Download:** [http://wordpress.org/plugins/woocommerce-pos](http://wordpress.org/plugins/woocommerce-pos)
* **Demo:** [http://demo.wcpos.com/pos](http://demo.wcpos.com/pos)
* **Website:** [http://wcpos.com](http://wcpos.com)

<p align="center">
  <img src="http://wcpos.com/wp-content/uploads/2015/05/pos-sale-lg.gif" alt="Screenshot"/>
</p>

## Report a bug

Please report all bugs [here](https://github.com/kilbot/WooCommerce-POS/issues) or contact support via [support@wcpos.com](mailto:support@wcpos.com)

## Translations

If you would like to help translate WooCommerce POS into your language please check out the [WooCommerce POS Language Packs](https://github.com/kilbot/WooCommerce-POS-Language-Packs) repository.

## Developing locally

WooCommerce POS is a WordPress plugin which requires [WordPress](http://wordpress.org) 3.8+ and [WooCommerce](wordpress.org/plugins/woocommerce) 3.2.6+.

This project includes configuration files for creating a consistent development environment for WooCommerce plugins. 

### Requirements

* [Docker](https://www.docker.com/products/docker) - download Docker for Mac, Windows or Linux 
* [Node](https://nodejs.org/)

Docker provides a virtual local server with WordPress and WooCommerce pre-installed. 
Node provides a package manager which simplifies tasks such as building and deploying the project.

### Installation

Navigate to your local projects directory and clone the project. 
The recursive flag will init and update any submodules. 

```sh
git clone --recursive https://github.com/kilbot/WooCommerce-POS.git woocommerce-pos
```

Then, navigate into the root directory of the project and install the dependencies.

```sh
cd woocommerce-pos && npm run build
```

Now, get a coffee :coffee:

The first build will take some time as it prepares the virtual server. 

```
npm run start
```

Open your browser and navigate to http://localhost and use `admin/password` to access the WordPress admin.

### Developing and Deploying

The `package.json` file contains some helpful commands for common tasks. 

When developing you should use the following command, this will watch the asset files and rebuild if necessary.

```sh
npm run dev
```

To create a minified version of the project ready to deploy, use:

```sh
npm run deploy
```

This will create a zip archive of the plugin which you can then install via your WordPress admin.

### We are hiring!

We are looking for talented PHP and JS developers to work full or part time on WooCommerce POS. To apply simply submit a pull request.
