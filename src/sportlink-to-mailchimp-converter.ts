/**
 * A DataConverterService that helps to convert a Sportlink export into a file that can be imported into Mailchimp.
 */

import * as Papa from 'papaparse'

export class SportlinkToMailchimpConverter {

  static async convertFileToPreview(file: File): Promise<PreviewResult<MailchimpSubscriber>> {
    return parseFileAndConvert(file).then((value) => {
      return {
        columns: Object.getOwnPropertyNames(mailchimpSubscriberProperties),
        rows: value
      }
    })
  }

  static async convertFileToOutput(file: File): Promise<OutputResult<MailchimpSubscriber>> {
    const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'))

    return parseFileAndConvert(file).then((value) => {
      return {
        mimetype: 'text/csv;charset=utf-8;',
        filename: originalFilename + '_converted_to_mailchimp.csv',
        data: value
      }
    })
  }
}

interface SportlinkRow {
  'E-mail': string
  Roepnaam: string;
  'Tussenvoegsel(s)': string;
  Achternaam: string;
  Leeftijdscategorie: string
  'Lidsoorten vereniging': string;
}

interface SportlinkContact {
  email: string
  firstname: string
  lastname: string
  tags: string[]
}

interface MailchimpSubscriber {
  'Email Address': string
  'First Name': string
  'Last Name': string
  Tags: string[]
}
type MailchimpSubscriberObject = Record<(keyof MailchimpSubscriber), undefined>;
const mailchimpSubscriberProperties: MailchimpSubscriberObject = {
  'Email Address': undefined,
  'First Name': undefined,
  'Last Name': undefined,
  Tags: undefined
}


const parseFileAndConvert = async (file: File): Promise<MailchimpSubscriber[]> => {
  return parseCsv(file).then((value): MailchimpSubscriber[] => {
    const sportlinkContacts = value.data
      .filter(row => !isNullOrEmpty(row['E-mail']))
      .map(sportlinkRowToContact)
    return sportlinkContactsToMailchimpSubscribers(sportlinkContacts)
  })
}

const membershipTypes = ['Lopers', 'Gastlid', 'Recreanten', 'Nordic Walking', 'Vrienden van Groene Ster', 'Overigen']
const sportlinkRowToContact = (row: SportlinkRow): SportlinkContact => {
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
  } else {
    tags.push(categorie)
  }

  return {
    email: row['E-mail'],
    firstname: row.Roepnaam,
    lastname: (((row['Tussenvoegsel(s)'] ? row['Tussenvoegsel(s)'] : '') + ' ' + row.Achternaam)).trim(),
    tags,
  }
}

const sportlinkContactsToMailchimpSubscribers = (contacts: SportlinkContact[]): MailchimpSubscriber[] => {
  const rows: MailchimpSubscriber[] = []
  contacts
    .reduce((accumulator: Map<string, SportlinkContact[]>, contact) => {
      const existing = accumulator.get(contact.email)
      if (existing == undefined) {
        return accumulator.set(contact.email, [contact])
      } else {
        return accumulator.set(contact.email, [...existing, contact])
      }
    }, new Map<string, SportlinkContact[]>())
    .forEach((value, key) => {
      rows.push(contactGroupToMailchimpContact(key, value))
    })

  return rows
}

const contactGroupToMailchimpContact = (email: string, contacts: SportlinkContact[]): MailchimpSubscriber => {
  return {
    'Email Address': email,
    'First Name': contacts[0].firstname,
    'Last Name': contacts[0].lastname,
    Tags: contacts.reduce((acc: string[], cur) => {
      return acc.concat(cur.tags)
    }, []),
  }
}

const contains = (haystack: string, needle: string) => haystack.toLowerCase().indexOf(needle.toLowerCase()) >= 0

const isNullOrEmpty = (text: string) => text === undefined || text === null || text.length <= 0

const parseCsv = async (file: File): Promise<Papa.ParseResult<SportlinkRow>> => {
  return new Promise((complete, error) => {
    Papa.parse<SportlinkRow>(file, {
      skipEmptyLines: true,
      dynamicTyping: true,
      quoteChar: '|',
      delimiter: ';',
      header: true,
      transformHeader(header) {
        return header.trim().replace('"', '').replace('"', '')
      },
      transform(value) {
        return value.trim().replace('"', '').replace('"', '')
      },
      error,
      complete
    })
  })
}

interface PreviewResult<T> {
  columns: string[]
  rows: T[]
}

interface OutputResult<T> {
  data: T[]
  filename: string
  mimetype: string
}
