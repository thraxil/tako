Feature: index

    Scenario: Simple Hello World
        Given I access the url "/"
        Then I see the header "Hello World"