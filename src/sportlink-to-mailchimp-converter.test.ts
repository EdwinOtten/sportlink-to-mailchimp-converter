import { describe, expect } from '@jest/globals'
import { SportlinkToMailchimpConverter } from './sportlink-to-mailchimp-converter'
import { Readable } from 'stream'

function streamFromString(text: string) {
  const s = new Readable()
  s.push(text)    // the string you want
  s.push(null)      // indicates end-of-file basically - the end of the stream
  return s
}

const EXAMPLE_CSV = `Roepnaam;Achternaam;E-mail;Leeftijdscategorie;Lidsoorten vereniging
Jane;Doe;jane.doe@example.com;Masters Vrouwen;Vrienden van Groene Ster - Recreatief - Week
John;Doe;john.doe@example.com;Senioren Mannen;Overigen - Recreatief - Week
Peter;von Zillertal;peter.von.zillertal@example.com;Masters Mannen;Lopers met wedstrijd licentie - recreatief - Week
Patricia;von Zillertal;patricia.von.zillertal@example.com;Masters Vrouwen;Recreanten - recreatief - Week, Senioren Groene Ster - Atletiek - Week`

describe('SportlinkToMailchimpConverter', () => {

  describe('convertFileToPreview', () => {

    it('should return expected object', async () => {
      // Arrange
      const file = streamFromString(EXAMPLE_CSV)
      const expected = {
        columns: ['Email Address', 'First Name', 'Last Name', 'Tags'],
        rows: [{
          "Email Address": "jane.doe@example.com",
          "First Name": "Jane",
          "Last Name": "Doe",
          "Tags": ['Vrienden van Groene Ster'],
        },
        {
          "Email Address": "john.doe@example.com",
          "First Name": "John",
          "Last Name": "Doe",
          "Tags": ['Overigen'],
        },
        {
          "Email Address": "peter.von.zillertal@example.com",
          "First Name": "Peter",
          "Last Name": "von Zillertal",
          "Tags": ['Lopers'],
        },
        {
          "Email Address": "patricia.von.zillertal@example.com",
          "First Name": "Patricia",
          "Last Name": "von Zillertal",
          "Tags": ['Recreanten', 'Atletiek Masters Vrouwen'],
        }]
      }

      // Act
      const result = await SportlinkToMailchimpConverter.convertFileToPreview(file)

      // Assert
      expect(result).toMatchObject(expected)
    })

  })

  describe('convertFileToOutput', () => {

    it('should return expected object', async () => {
      // Arrange
      const file = streamFromString(EXAMPLE_CSV)
      const expected = {
        data: `Email Address,First Name,Last Name,Tags
jane.doe@example.com,Jane,Doe,Vrienden van Groene Ster
john.doe@example.com,John,Doe,Overigen
peter.von.zillertal@example.com,Peter,von Zillertal,Lopers
patricia.von.zillertal@example.com,Patricia,von Zillertal,"Recreanten,Atletiek Masters Vrouwen"`.replace(/(\r\n|\n|\r)/gm,'\r\n'),
        mimetype: 'text/csv;charset=utf-8;'
      }

      // Act
      const result = await SportlinkToMailchimpConverter.convertFileToOutput(file)

      // Assert
      expect(result).toMatchObject(expected)
    })

  })

})
