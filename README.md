# ![GAdder Logo](images/gadder64.png) GAdder

Welcome to **GAdder** - *GitHub Projects (Beta) Helper*.

![A GAdder usage example](images/gadder.gif)

## How to use it?

1. Install the extension.
2. Open a *GitHub Project (Beta)*.
3. Type `q=` into the *add an item* box.
4. Either click on an individual issue to create a single project item or click `Add all * issues` to create `*` project items.

## What is the q syntax?

You can use GitHub's full [Searching issues and pull requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests) syntax.

## Does it work cross-org?

Yes! That's the main reason it got created - because the GraphQL API doesn't allow cross-org issue creation yet.

## Does it matter which input box I use?

Yes! If your view is grouped, the items created through this extension will contain the group value associated with the input box you used.

## Why doesn't the search show issues and pull requests which are already in the project?

The extension automatically appends `-project:*` to the input query to avoid showin issues and pull requests which are already in the project because duplicate items cannot be created in *GitHub Projects (Beta)*.

## What's the story behind the name?

GitHub Projects (Beta) Helper for Adding Project Items Based on GitHub Search Results -> GitHub Project Item Adder -> GitHub Adder -> GAdder

## What's the story behind the logo?

GAdder -> Adder -> Blackadder -> Turnip
