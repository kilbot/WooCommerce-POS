Feature: Barcode

  Background:
    Given I have logged in to the POS

  @barcode
  Scenario: Barcode HotKey
    When I use the barcode hotkey
    Then I should be in barcode mode