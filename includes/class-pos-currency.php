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
	public function get_denomination($code) {

		$denomination = array(

			// United Arab Emirates Dirham
			'AED' => array(
				'coin' => array(0.25, 0.50, 1),
				'notes' => array(5, 10, 20, 50, 100, 200, 500, 1000)
			),

			// Australian Dollars
			'AUD' => array(
				'coin' => array(0.05, 0.1, 0.2, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100)
			),

			// Bangladeshi Taka
			'BDT' => array(
				'coin' => array(),
				'notes' => array()
			),

			// Bulgarian Lev
			'BGN' => array(
				'coin' => array(),
				'notes' => array()
			),

			// Brazilian Real
			'BRL' => array(
				'coin' => array(5, 10, 25, 50, 1),
				'notes' => array(2, 5, 10, 20, 50, 100)
			),

			// Canadian Dollars
			'CAD' => array(
				'coin' => array(0.01, 0.05, 0.1, 0.25, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100)
			),

			// Swiss Franc
			'CHF' => array(
				'coin' => array(0.05, 0.1, 0.2, 0.5, 1, 2, 5),
				'notes' => array(10, 20, 50, 100, 200, 500, 1,00)
			),
			
			// Chilean Peso
			'CLP' => array(
				'coin' => array(1, 5, 10, 50, 100, 500),
				'notes' => array(1000, 2000, 5000, 10000, 20000)
			),
			
			// Chinese Yuan
			'CNY' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Colombian Peso
			'COP' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Czech Koruna
			'CZK' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Danish Krone
			'DKK' => array(
				'coin' => array(0.25, 0.5, 1, 2, 5, 10, 20),
				'notes' => array(50, 100, 200, 500, 1,000)
			),
			
			// Dominican Peso
			'DOP' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Egyptian Pound
			'EGP' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Euros
			'EUR' => array(
				'coin' => array(0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100, 200, 500)
			),
			
			// Pounds Sterling
			'GBP' => array(
				'coin' => array(0.01, 0.02, 0.05, 0.1, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50)
			),
			
			// Hong Kong Dollar
			'HKD' => array(
				'coin' => array(10, 20, 50, 1, 2, 5, 10),
				'notes' => array(10, 20, 50, 100, 500, 1000)
			),
			
			// Croatia kuna
			'HRK' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Hungarian Forint
			'HUF' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Indonesia Rupiah
			'IDR' => array(
				'coin' => array(100, 200, 500, 1000),
				'notes' => array(1000, 2000, 5000, 10000, 20000, 50000, 100000)
			),
			
			// Israeli Shekel
			'ILS' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Indian Rupee
			'INR' => array(
				'coin' => array(0.50, 1, 2, 5, 10),
				'notes' => array(1, 2, 5, 10, 20, 50, 100, 500, 1000)
			),
			
			// Icelandic krona
			'ISK' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Japanese Yen
			'JPY' => array(
				'coin' => array(1, 5, 10, 50, 100, 500),
				'notes' => array(1000, 2000, 5000, 10000)
			),
			
			// South Korean Won
			'KRW' => array(
				'coin' => array(1, 5, 10, 50, 100, 500),
				'notes' => array(1000, 5000, 10000)
			),
			
			// Mexican Peso
			'MXN' => array(
				'coin' => array(50, 1, 2, 5, 10),
				'notes' => array(20, 50, 100, 200, 500)
			),
			
			// Malaysian Ringgits
			'MYR' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Nigerian Naira
			'NGN' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Norwegian Krone
			'NOK' => array(
				'coin' => array(0.5, 1, 5, 10, 20),
				'notes' => array(50, 100, 200, 500, 1000)
			),
			
			// New Zealand Dollar
			'NZD' => array(
				'coin' => array(0.1, 0.2, 0.5, 1, 2),
				'notes' => array(5, 10, 20, 50, 100)
			),
			
			// Philippine Pesos
			'PHP' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Polish Zloty
			'PLN' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Romanian Leu
			'RON' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Russian Ruble
			'RUB' => array(
				'coin' => array(0.10, 0.50, 1, 2, 5, 10, 25),
				'notes' => array(50, 100, 500, 1000)
			),
			
			// Swedish Krona
			'SEK' => array(
				'coin' => array(0.5, 1, 2, 5, 10),
				'notes' => array(20, 50, 100, 500, 1000)
			),
			
			// Singapore Dollar
			'SGD' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Thai Baht
			'THB' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Turkish Lira
			'TRY' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// Taiwan New Dollars
			'TWD' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// US Dollars
			'USD' => array(
				'coin' => array(0.01, 0.05, 0.1, 0.25, 0.5, 1),
				'notes' => array(1, 2, 5, 10, 20, 50, 100)
			),
			
			// Vietnamese Dong
			'VND' => array(
				'coin' => array(),
				'notes' => array()
			),
			
			// South African rand
			'ZAR' => array(
				'coin' => array(10, 20, 50, 1, 2, 5),
				'notes' => array(10, 20, 50, 100, 200)
			),
			
			// Paraguayan Guaraní
			'PYG' => array(
				'coin' => array(),
				'notes' => array()
			)

		);

		return $denomination[$code];
	}                       		   

}