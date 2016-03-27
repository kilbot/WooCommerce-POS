#!/usr/bin/env bash

DB_NAME=${1-woopos_integration_tests}
DB_USER=${2-root}
DB_PASS=${2-root}

if [ -f ../../../wp-config.php ]; then
  rm -f ../../../wp-config.php;
fi

# create database
mysqladmin -f drop $DB_NAME || true
mysqladmin create $DB_NAME --user="$DB_USER" --password="$DB_PASS" || true

wp core config --dbname=$DB_NAME --dbuser=$DB_USER --dbpass=$DB_USER --extra-php <<PHP
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'SCRIPT_DEBUG', true );
PHP

wp core install --url=woopos.dev --title=WooCommercePOS --admin_user=admin --admin_password=password --admin_email=support@woopos.com.au

# install and activate WooCommerce
wp plugin is-installed woocommerce
if [[ $? == 1 ]]; then
  wp plugin install woocommerce --activate
fi
wp plugin activate woocommerce

# import WooCommerce products
wp plugin install wordpress-importer --activate
wp import ../woocommerce/dummy-data/dummy-data.xml --authors=create --skip=attachment

# import WooCommerce tax
wp option update woocommerce_calc_taxes yes


# activate WooCommerce POS
wp plugin activate woocommerce-pos

#  - wp plugin activate woocommerce-pos
#  - wp plugin activate woocommerce-pos-test
#  -
#  - wp plugin install wordpress-importer --activate
#  - wp import wp-content/plugins/woocommerce/dummy-data/dummy-data.xml --authors=create
#  - wp option update woocommerce_api_enabled yes
#  - cp wp-content/plugins/woocommerce-pos/tests/integration/php/bin/wp-cli.yml ./
#  - wp rewrite flush --hard