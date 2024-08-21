# sportlink-to-mailchimp-converter
A node module that converts Sportlink exports (.csv) into a csv you can import into Mailchimp.

## Latest build status
![Release pipeline](https://github.com/EdwinOtten/sportlink-to-mailchimp-converter/actions/workflows/npm-publish.yml/badge.svg)

## How to use

1. Install the node module:
    ```
    npm install sportlink-to-mailchimp-converter
    ```
2. Import the module in your code:
    ```js
    // Javascript
    const SportlinkToMailchimpConverter = require('sportlink-to-mailchimp-converter')
    ```
    ```ts
    // Typescript
    import { SportlinkToMailchimpConverter } from 'sportlink-to-mailchimp-converter'
    ```
3. And use it:
    ```js
    console.log(SportlinkToMailchimpConverter.convertFileToOutput(file))
    ```

## Examples

You can use [example-input.csv](/example-input.csv) to test.