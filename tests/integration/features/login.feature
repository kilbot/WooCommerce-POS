Feature: Login

  Background:
    Given I visit the POS

  Scenario: Logging in
    When I enter login/pass as demo/demo
    Then I should see the POS
