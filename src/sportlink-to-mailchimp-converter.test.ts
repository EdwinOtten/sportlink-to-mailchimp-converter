import { describe, expect } from 'jest'
import { SportlinkToMailchimpConverter } from './sportlink-to-mailchimp-converter'
import { Readable } from 'stream'

function streamFromString(text: string) {
  const s = new Readable()
  s.push(text)    // the string you want
  s.push(null)      // indicates end-of-file basically - the end of the stream
  return s
}

const EXAMPLE_CSV = `Roepnaam;Achternaam;E-mail;Leeftijdscategorie;Lidsoorten vereniging
Jane;Doe;family.doe@example.com;Masters Vrouwen;Vrienden van mijn vereniging - Recreatief - Week, Senioren Groene Ster - Atletiek - Week
John;Doe;family.doe@example.com;Senioren Mannen;Lopers met wedstrijd licentie - recreatief - Week
Alice;Henderson;alice.henderson@example.com;Masters Vrouwen;
Peter;von Zillertal;peter.von.zillertal@example.com;Masters Mannen;Overigen - Recreatief - Week
Patricia;von Zillertal;patricia.von.zillertal@example.com;Masters Vrouwen;Recreanten - recreatief - Week, Senioren Groene Ster - Atletiek - Week`

describe('SportlinkToMailchimpConverter', () => {
  let converter: SportlinkToMailchimpConverter

  beforeAll(() => {
    converter = new SportlinkToMailchimpConverter({
      nonAthleticsMembershipTypes: ['Lopers', 'Gastlid', 'Recreanten', 'Nordic Walking', 'Vrienden van mijn vereniging', 'Overigen'],
      athleticsMembershipTypes: ['Atletiek']
    })
  })

  describe('convertFileToPreview', () => {

    it('should return expected object', async () => {
      // Arrange
      const file = streamFromString(EXAMPLE_CSV)
      const expected = {
        columns: ['Email Address', 'First Name', 'Last Name', 'Tags'],
        rows: [{
          "Email Address": "family.doe@example.com",
          "First Name": "Jane",
          "Last Name": "Doe",
          "Tags": ['Vrienden van mijn vereniging', 'Atletiek Masters', 'Lopers'],
        },
        {
          "Email Address": "alice.henderson@example.com",
          "First Name": "Alice",
          "Last Name": "Henderson",
          "Tags": ['Atletiek Masters'],
        },
        {
          "Email Address": "peter.von.zillertal@example.com",
          "First Name": "Peter",
          "Last Name": "von Zillertal",
          "Tags": ['Overigen'],
        },
        {
          "Email Address": "patricia.von.zillertal@example.com",
          "First Name": "Patricia",
          "Last Name": "von Zillertal",
          "Tags": ['Recreanten', 'Atletiek Masters'],
        }]
      }

      // Act
      const result = await converter.convertFileToPreview(file)

      // Assert
      expect(result).toMatchObject(expected)
    })

  })

  describe('convertFileToOutput', () => {

    it('should reject invalid file', async () => {
      // Arrange
      const file = streamFromString(`Name; Age; Occupation
John Doe; 35; Software Engineer
Jane Doe; 30; Doctor
Robert; Smith; 40; Lawyer; Senior; lala; lalal2; "llaala4`)

      const expectedError = 'type: FieldMismatch, code: TooManyFields, message: Too many fields: expected 3 fields but parsed 8, row: 2, index: undefined'

      // Act & assert
      await expect(converter.convertFileToOutput(file)).rejects.toEqual(new Error(expectedError))
    })

    it('should return expected object', async () => {
      // Arrange
      const file = streamFromString(EXAMPLE_CSV)
      const expected = {
        data: `Email Address,First Name,Last Name,Tags
family.doe@example.com,Jane,Doe,"Vrienden van mijn vereniging,Atletiek Masters,Lopers"
alice.henderson@example.com,Alice,Henderson,Atletiek Masters
peter.von.zillertal@example.com,Peter,von Zillertal,Overigen
patricia.von.zillertal@example.com,Patricia,von Zillertal,"Recreanten,Atletiek Masters"`.replace(/(\r\n|\n|\r)/gm, '\r\n'),
        mimetype: 'text/csv;charset=utf-8;'
      }

      // Act
      const result = await converter.convertFileToOutput(file)

      // Assert
      expect(result).toMatchObject(expected)
    })

  })

})
