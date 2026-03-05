--- Prompt 1 ---

# Intro

We are building a single page webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

The webapp is composed of four screens
- Initial configuration screen
- Homepage
- Sentence practice
- Sentence review and editing

The Japanese sentences should be stored in a global map of `<id, SentenceData>` where `SentenceData` contains an english sentence, a primary Japanese translation and a list of accepted alternate translations.

## Initial configuration screen

The initial configuration screen serves as a landing page if the user does not have any github token setup in their local storage for the webapp. It prompts the user for
- a github token with an edit level permission on this webapp's `index.html` file
- the github repository address where the webapp is hosted
- the path of this webapp's `index.html` file on the remote repository

## Homepage

The homepage is the landing page when the user local storage is configured. It has
- A button to go to sentence practice
- A button to review and edit sentences
- A button to clear local storage configurations

## Sentence practice

The sentence practice should prepare a randomly ordered list of sentences for the user to translate from english to japanese. It should display english sentences for the user to translate, accepting alternate Japanese translations, one by one.
If the user fails the translation, the sentence should be inserted 10 sentences back in the randomly ordered list.
If the user succeeds the translation, the sentence should be dropped from the list.

The sentence practice screen should have a button to return to the homepage.

## Sentence review and editing

This page should display the complete list of sentences to the user. The user should be able to add and edit sentences. 
There should be a button to sync the edited map with the remote github repository using the configured settings.
The sync process should get the latest version of the `index.html` file on the remote repository, edit the global sentences map with the local edited sentences and push the edited `index.html` file back to the remote repository.

# Action

Create this webapp

--- Prompt 2 ---

Never enforce punctuation or spacing when validating an answer.
When the user enters an answer (correct or incorrect), wait for an explicit button press before moving on to the next sentence.

--- Prompt 3 ---

Give `sentencesMap` for the below japanese sentences (only the `sentencesMap`, no need to include the whole `index.html`)

--- Prompt 4 ---

When the user response is incorrect, add an option to add an alternate translation and override the result as correct.
On the homepage, we should have a warning banner if there is unsynced data, with the option to sync the data to github.
The sentence practice should always consider edited sentence data instead of just the harcoded map.

Give only the diffs to make for these changes instead of the entire `index.html`.