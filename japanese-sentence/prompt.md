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

--- Prompt 5 ---

# Feature

## Intro

We are building a single page mobile-first webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

We want to add a spaced repetition based sentence scoring feature to the app.

## Sentence score

Each sentence has a `score` which describes how well the user has responded to this sentence in the past.

- All sentences initially have a score of 100
- When the user responds incorrectly, the sentence score is updated to `0.2 x currentScore`
- When the user responds correctly, the sentence score is updated to `1.2 x currentScore`

## Sentence last studied at

Each sentence has a `lastStudiedAt` which describes the last time that the sentence was studied by the user.
A sentence is considered studied by the user when the user has responded (correctly or incorrectly) when prompted to translate the sentence.

## Sentence priority

Using a sentence's `score` and `lastStudiedAt`, we compute a sentence's `priority` which is the sentence `score` divided by the time since the last review session (`now` - `lastStudiedAt`)

Expressed formally as `priority = score / (now - lastStudiedAt)`

This sentence priority is used to create a priority queue of sentences which the user then studies through during their study session.

## Study sessions

A study session now occurs on the complete set of sentences, as a priority queue.

When a user's answer is incorrect

- we display both the user answer and the correct answer
- the user cannot progress to the next sentence until they input a correct answer, the sentence is still considered as originally responded incorrectly

When a user overrides an incorrect sentence answer, we consider the sentence score as if the user had originally responded correctly.

## Storage and evolvability considerations

Each sentence's `lastStudiedAt` and `score` should be stored in the webapp's local storage for inter-session persistence.

Make sure that the peristed state is handled in a evolvable way, namely

- sentences that did not previously exist in the stored state are initialized with a score of 100
- the state should be normalized with regards to the global store of sentences to avoid diverging/conflicting data

# Action

Implement this feature, give only the diffs to apply to the `index.html` file

--- Prompt 6 ---

When a sentence is studied, it should be reinserted at the correct place in the priority queue with regards to its new sentence `score` and `lastStudiedAt`.

Give only the diffs to apply to the `index.html` file

--- Prompt 7 ---

# Feature

## Intro

We are building a single page mobile-first webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

We want to correct the unsynced changes feature which currently does not compare the remote with the in-memory sentence edits.

## Issue explained

Once the app has reloaded, the in-memory changes are lost and as such, they can no longer be synced to the remote `index.html` file. However, the un-synced changes warning banner is still displayed.

These in-memory sentence edits should not be persisted to local storage as they might then conflict with code or data changes on the remote.

## Expected behaviour

The edited sentences should stay in-memory only, and the warning banner should only be displayed if there are in-memory sentence edits to sync to the remote repository's `index.html`.

# Action

Implement this feature, give only the changes to apply to the `index.html` file

--- Prompt 8 ---

When overriding an incorrect sentence, add a confirmation modal displaying

- the original sentence
- the primary translation
- the new sentence that will be added as alternate translation

Give only the changes to apply to the `index.html` file for the above change.

--- Prompt 9 ---

# Feature

## Intro

We are building a single page mobile-first webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

We want to make the differences between the primary correct sentence translation and the user's incorrect answer explicit and easily visible by color coding the differences with the user's answer.

The primary sentence translation should be displayed entirely in green.

Matching words in the user's incorrect answer should be displayed in green. Words that do not match should be displayed in red.

# Action

Implement this feature, give only the changes to apply to the `index.html` file

--- Prompt 10 ---

# Feature

## Intro

We are building a single page mobile-first webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

We want to remove the sentence priority logic and replace it with an list positioning logic. The issue with the current priority system is that the user will always be studying the same sentence until it gets promoted enough to rejoin other sentences of the same level, making for poor actual recall based studying.

## Score logic

The score logic should be refactored to be a simple linear increment.

- All sentences start with a default score of 0
- When a sentence is answered correctly, it scores increases by 1
- When a sentence is answered incorrectly
  - If it has a score >2, then it's score gets reset to 2
  - If it has a score <=2, then it's score gets reset to 0
- A sentence score cannot go below 0

## Positioning logic

The priority computation and list ordering logic should be removed entirely. Instead, when a sentence is studied it should be re-inserted at a given index in the list depending on that sentence's score.

The sentence is re-inserted at a position determined by the formula `position = 2^(score+1)`.

# Action

Implement this feature, give only the changes to apply to the `index.html` file

--- Prompt 11 ---

# Feature

## Intro

We are building a single page mobile-first webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

We want the sentence ordering to be kept between study sessions and webapp reloads.

## Persist sentence order

The position of each sentence should be persisted to local storage so that it remains the same between study sessions.

New sentences that do not exist in the persisted list should be inserted at the beginning of the list.

Take special care to have a total ordering of all sentences, it shouldn't be possible for two sentences to share the same position (you might model away the possibility by modelling sentence positions as an array of sentence identifiers)

# Action

Implement this feature, give only the changes to apply to the `index.html` file

--- Prompt 12 ---

# Feature

## Intro

We are building a single page mobile-first webapp for practicing written Japanese. The code should be entirely in pure javascript, css and html in a single index.html file.

We add a feature to display the current studied sentence score and to let the user skip a sentence or to not be penalized for a mistake. 

## Display sentence score

The current score of the sentence should be displayed in the bottom right section of the sentence card. The sentence score should be color coded depending on it's value, ranging from red for a sentence score of 0, to green for a sentence score >= 10.

## Skip sentence button

There should be a button in the bottom left part of the sentence card to skip the current sentence. Skipping displays a modal asking the user if they which to change update the score of this sentence with three options
- don't change
- score +1
- score +2

The sentence is then re-inserted in the list depending on the updated sentence score.

## No mistake penalty

Current behaviour is that when a sentence is answered incorrectly, the user is shown the primary translation and prompted to enter a correct translation.
At this point, we should display a button that allows the user to opt to not have the sentence score be updated for this mistake.

## Other UI updates

- Remove the display of the total number of sentence remaining in the queue

# Action

Implement these features, give only the changes to apply to the `index.html` file

--- Prompt 13 ---

# Feature

## Intro

The webapp currently does not allow changing the github repository path and github personal access token. We want to add an option to allow the user to change the locally stored settings from the home page.

## Configuration

A `Edit Config` button should be added to the homepage.
Clicking on the `Edit Config` button should open a modal which allows updating the currently set github configurations.
The current `Clear Config` button on the homepage should be removed from the homepage and moved to the `Edit Config` modal.
The `Edit Config` modal should have a `Save` button which saves the new configuration to the webapp local storage.

# Action

Implement these features, give only the changes to apply to the `index.html` file