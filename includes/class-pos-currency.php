<?php

/**
 * Currency denominations
 * 
 * @class 	  WooCommerce_POS_Currency
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Currency {

	/**
	 *
	 */
	public static function get_denomination($code = '') {

		$denominations = array(

			// United Arab Emirates Dirham
			'AED' => array(
				'coins' => array(0.25, 0.50, 1),
				'notes' => array(5, 10, 20, 50, 100, 200, 500, 1000)
			),

			// Australian Dollars
			'AUD' => array(
				'coins' => array(0.05, 0.1, 0.2, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100)
			),

			// Bangladeshi Taka
			'BDT' => array(
				'coins' => array(),
				'notes' => array()
			),

			// Bulgarian Lev
			'BGN' => array(
				'coins' => array(),
				'notes' => array()
			),

			// Brazilian Real
			'BRL' => array(
				'coins' => array(5, 10, 25, 50, 1),
				'notes' => array(2, 5, 10, 20, 50, 100)
			),

			// Canadian Dollars
			'CAD' => array(
				'coins' => array(0.01, 0.05, 0.1, 0.25, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100)
			),

			// Swiss Franc
			'CHF' => array(
				'coins' => array(0.05, 0.1, 0.2, 0.5, 1, 2, 5),
				'notes' => array(10, 20, 50, 100, 200, 500, 1,00)
			),
			
			// Chilean Peso
			'CLP' => array(
				'coins' => array(1, 5, 10, 50, 100, 500),
				'notes' => array(1000, 2000, 5000, 10000, 20000)
			),
			
			// Chinese Yuan
			'CNY' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Colombian Peso
			'COP' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Czech Koruna
			'CZK' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Danish Krone
			'DKK' => array(
				'coins' => array(0.25, 0.5, 1, 2, 5, 10, 20),
				'notes' => array(50, 100, 200, 500, 1,000)
			),
			
			// Dominican Peso
			'DOP' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Egyptian Pound
			'EGP' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Euros
			'EUR' => array(
				'coins' => array(0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100, 200, 500)
			),
			
			// Pounds Sterling
			'GBP' => array(
				'coins' => array(0.01, 0.02, 0.05, 0.1, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50)
			),
			
			// Hong Kong Dollar
			'HKD' => array(
				'coins' => array(10, 20, 50, 1, 2, 5, 10),
				'notes' => array(10, 20, 50, 100, 500, 1000)
			),
			
			// Croatia kuna
			'HRK' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Hungarian Forint
			'HUF' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Indonesia Rupiah
			'IDR' => array(
				'coins' => array(100, 200, 500, 1000),
				'notes' => array(1000, 2000, 5000, 10000, 20000, 50000, 100000)
			),
			
			// Israeli Shekel
			'ILS' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Indian Rupee
			'INR' => array(
				'coins' => array(0.50, 1, 2, 5, 10),
				'notes' => array(1, 2, 5, 10, 20, 50, 100, 500, 1000)
			),
			
			// Icelandic krona
			'ISK' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Japanese Yen
			'JPY' => array(
				'coins' => array(1, 5, 10, 50, 100, 500),
				'notes' => array(1000, 2000, 5000, 10000)
			),
			
			// South Korean Won
			'KRW' => array(
				'coins' => array(1, 5, 10, 50, 100, 500),
				'notes' => array(1000, 5000, 10000)
			),
			
			// Mexican Peso
			'MXN' => array(
				'coins' => array(0.5, 1, 2, 5, 10),
				'notes' => array(20, 50, 100, 200, 500)
			),
			
			// Malaysian Ringgits
			'MYR' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Nigerian Naira
			'NGN' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Norwegian Krone
			'NOK' => array(
				'coins' => array(0.5, 1, 5, 10, 20),
				'notes' => array(50, 100, 200, 500, 1000)
			),
			
			// New Zealand Dollar
			'NZD' => array(
				'coins' => array(0.1, 0.2, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100)
			),
			
			// Philippine Pesos
			'PHP' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Polish Zloty
			'PLN' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Romanian Leu
			'RON' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Russian Ruble
			'RUB' => array(
				'coins' => array(0.10, 0.50, 1, 2, 5, 10, 25),
				'notes' => array(50, 100, 500, 1000)
			),
			
			// Swedish Krona
			'SEK' => array(
				'coins' => array(0.5, 1, 2, 5, 10),
				'notes' => array(20, 50, 100, 500, 1000)
			),
			
			// Singapore Dollar
			'SGD' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Thai Baht
			'THB' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Turkish Lira
			'TRY' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// Taiwan New Dollars
			'TWD' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// US Dollars
			'USD' => array(
				'coins' => array(0.01, 0.05, 0.1, 0.25, 0.5, 1),
				'notes' => array(1, 2, 5, 10, 20, 50, 100)
			),
			
			// Vietnamese Dong
			'VND' => array(
				'coins' => array(),
				'notes' => array()
			),
			
			// South African rand
			'ZAR' => array(
				'coins' => array(10, 20, 50, 1, 2, 5),
				'notes' => array(10, 20, 50, 100, 200)
			),
			
			// Paraguayan Guaraní
			'PYG' => array(
				'coins' => array(),
				'notes' => array()
			)

		);

		return $code ? $denominations[$code] : $denominations;
	}                       		   

}