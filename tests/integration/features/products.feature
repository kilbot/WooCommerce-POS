Feature: Products

Background:
  Given I have logged in to the POS

@products
Scenario: Viewing products list
  Then I should see the Products module
  Then I should count at least 10 products

  When I scroll down
#  Then I should see more products
#
#  When I scroll down again
#  Then I should see a total of 23 products
#
#  When I click the 'On Sale' tab
#  Then I should see 5 products

  When I search for 'happy'
  Then I should see 2 products