/**
 * A DataConverterService that helps to convert a Sportlink export into a file that can be imported into Mailchimp.
 */

import * as Papa from 'papaparse'

export class SportlinkToMailchimpConverter {

  static async convertFileToPreview(file: File): Promise<PreviewResult> {
    const input = await parseCsv(file)
    const rows = input.data
      .filter(row => !isNullOrEmpty(row['E-mail']))
      .map(sporlinkRowToContact)
      .reduce((accumulator: { [key: string]: ContactGroup }, contact) => {
        if (!accumulator.hasOwnProperty(contact.email)) {
          accumulator[contact.email] = { email: contact.email, contacts: []}
        }
        accumulator[contact.email].contacts.push()
        return accumulator
      }, {})
      .map(Object.getOwnProperties)
      .map(contactGroupToMailchimpContact)

    return {
      columns: Object.getOwnPropertyNames(rows[0]),
      rows
    }
  }

  static async convertFileToOutput(file: File): Promise<OutputResult> {
    const data = await this.convertFileToPreview(file)
    const csvData = Papa.unparse(data.rows, {
      quotes: true
    })

    const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'))
    return {
      mimetype: 'text/csv;charset=utf-8;',
      filename: originalFilename + '_converted_to_mailchimp.csv',
      data: csvData
    };
  }
}

interface SportlinkContact {
  email: string
  firstname: string
  lastname: string
  tags: string[]
}

interface ContactGroup {
  email: string
  contacts: SportlinkContact[]
}

const membershipTypes = ['Lopers', 'Gastlid', 'Recreanten', 'Nordic Walking', 'Vrienden van Groene Ster', 'Overigen']
const sporlinkRowToContact = (row: any): SportlinkContact => {
  const tags: string[] = []
  const categorie = row.Leeftijdscategorie
  if (row['Lidsoorten vereniging'] && row['Lidsoorten vereniging'].length > 0) {
    const lidSoorten: string[] = row['Lidsoorten vereniging'].split(',')
    lidSoorten.forEach(lidSoort => {
      if (contains(lidSoort, 'Atletiek') || contains(lidSoort, 'Klatjes')) {
        tags.push(`Atletiek ${categorie}`)
      }
      membershipTypes.forEach(membershipType => {
        if (contains(lidSoort, membershipType)) {
          tags.push(membershipType)
        }
      })
    })
  }  else {
    tags.push(categorie)
  }

  return {
    email: row['E-mail'],
    firstname: row.Roepnaam,
    lastname: (((row['Tussenvoegsel(s)'] ? row['Tussenvoegsel(s)'] : '') + ' ' + row.Achternaam) as string).trim(),
    tags,
  }
}
const contactGroupToMailchimpContact = (contactGroup: ContactGroup) => {
  return {
    'Email Address': contactGroup.email,
    'First Name': contactGroup.contacts[0].firstname,
    'Last Name': contactGroup.contacts[0].lastname,
    Tags: contactGroup.contacts.reduce((acc: string[], cur) => {
      return acc.concat(cur.tags)
    }, []),
  }
}

const contains = (haystack: string, needle: string) => haystack.toLowerCase().indexOf(needle.toLowerCase()) >= 0
const isNullOrEmpty = (text: string) => text === undefined || text === null || text.length <= 0

const parseCsv = async(file: File): Promise<Papa.ParseResult> => {
  return new Promise((complete, error) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      dynamicTyping: true,
      quoteChar: '|',
      delimiter: ';',
      header: true,
      transformHeader(header) {
        return header.trim().replace('"', '').replace('"', '');
      },
      transform(value) {
        return value.trim().replace('"', '').replace('"', '');
      },
      error,
      complete
    })
  })
}

interface PreviewResult {
  columns: string[]
  rows: any
}

interface OutputResult {
  data: any
  filename: string
  mimetype: string
}
