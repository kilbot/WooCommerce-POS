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
    Then I should see at least 7 products

    When I use the barcode hotkey + 'barcode'
    Then An item should be added to the cart

    When I use the barcode hotkey + 'barcode' again
    Then The item should be added to the cart again