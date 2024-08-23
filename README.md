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
    const converter = new SportlinkToMailchimpConverter({
      nonAthleticsMembershipTypes: ['Gastlid', 'Recreanten', 'Overigen'],
      athleticsMembershipTypes: ['Atletiek']
    })

    console.log(converter.convertFileToOutput(file))
    ```

## Examples

You can use [example-input.csv](/example-input.csv) to test.

## Config

The configuration object looks like this:
```ts
{
    nonAthleticsMembershipTypes: string[]
    athleticsMembershipTypes: string[]
}
```
These values are used to recognize the _"Lidsoorten vereniging"_ in your Sportlink export. For every string you provide in those arrays, the `SportlinkToMailchimpConverter` will scan the lidsoorten column in your csv file:
- For every `nonAthleticsMembershipTypes` it finds, it will add a Mailchimp tag with that membershipType in the output.
- For every `athleticsMembershipTypes` it finds, it will add a Mailchimp tag with _"Atletiek <category>"_ in the output.


## Credits

### Dependencies
- Special thanks to the developers and maintainers of [papaparse](https://www.npmjs.com/package/papaparse) for providing an easy to use library that helps me parse and serialze CSV files.

### Trademarks
All trademarks, inlcuding (but not limited to) _Mailchimp_ and _Sportlink_, are the property of their respective owners.
