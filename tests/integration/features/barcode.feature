Feature: Barcode

  Background:
    Given I have logged in to the POS

  @barcode
  Scenario: Barcode Mode
    When I use the barcode hotkey
    Then I should be in barcode mode
    When I search for barcodes starting with 'woo'
    Then I should see only products with 'woo' in the barcode

    When I click the dropdown
    Then I click the normal search mode
    Then I should see 7 products

    When I use the barcode hotkey + 'woo'
    Then I should see only products with 'woo' in the barcode