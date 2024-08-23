/**
 * A DataConverterService that helps to convert a Sportlink export into a file that can be imported into Mailchimp.
 */

import * as Papa from 'papaparse'
import { LocalFile } from 'papaparse'
import { MailchimpSubscriber, MailchimpSubscriberObject, OutputResult, PreviewResult, SportlinkContact, SportlinkRow } from './models'
import { isNullOrEmpty, stripGender, trimSpacesAndRemoveDoubleQuotes } from './string-utilities'

export interface SportlinkToMailchimpConverterConfig {
  nonAthleticsMembershipTypes: string[]
  athleticsMembershipTypes: string[]
}

export class SportlinkToMailchimpConverter {
  public constructor(private readonly config: SportlinkToMailchimpConverterConfig) {
  }

  public async convertFileToPreview(file: LocalFile): Promise<PreviewResult<MailchimpSubscriber>> {
    return this.parseFileAndConvert(file).then((value) => {
      return {
        columns: Object.getOwnPropertyNames(mailchimpSubscriberProperties),
        rows: value
      }
    })
  }

  public async convertFileToOutput(file: LocalFile): Promise<OutputResult<string>> {
    return this.parseFileAndConvert(file).then((value) => {
      return {
        mimetype: 'text/csv;charset=utf-8;',
        data: Papa.unparse(value, { header: true })
      }
    })
  }

  private async parseFileAndConvert(file: LocalFile): Promise<MailchimpSubscriber[]> {
    const rows = await parseCsv(file)
    return sportlinkContactsToMailchimpSubscribers(
      rows
        .filter(row => !isNullOrEmpty(row['E-mail']))
        .map((row) => sportlinkRowToContact(row, this.config))
    )
  }
}

const mailchimpSubscriberProperties: MailchimpSubscriberObject = {
  'Email Address': undefined,
  'First Name': undefined,
  'Last Name': undefined,
  Tags: undefined
}

const sportlinkRowToContact = (row: SportlinkRow, config: SportlinkToMailchimpConverterConfig): SportlinkContact => {
  const tags: string[] = []
  const categorie = row.Leeftijdscategorie
  const lidSoorten: string[] = (row['Lidsoorten vereniging'] ?? "").split(',')

  // Generate tags based on lidsoorten
  for (const lidSoort of lidSoorten) {

    for (const membershipType of config.athleticsMembershipTypes) {
      // Do a partial match on the possible athleticsMembershipTypes
      if (lidSoort.toLowerCase().includes(membershipType.toLowerCase())) {
        tags.push(`Atletiek ${stripGender(categorie)}`)
      }
    }

    for (const membershipType of config.nonAthleticsMembershipTypes) {
      // Do a partial match on the possible nonAthleticsMembershipTypes
      if (lidSoort.toLowerCase().includes(membershipType.toLowerCase())) {
        tags.push(membershipType)
      }
    }

  }

  // If not tagged yet, assume Athletics
  if (tags.length == 0) {
    tags.push(`Atletiek ${stripGender(categorie)}`)
  }

  return {
    email: row['E-mail'],
    firstname: row.Roepnaam,
    // lastname: (((row['Tussenvoegsel(s)'] ? row['Tussenvoegsel(s)'] : '') + ' ' + row.Achternaam)).trim(),
    lastname: row.Achternaam,
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

const parseCsv = (file: LocalFile) => new Promise<SportlinkRow[]>((resolve, reject) => {

  const config: Papa.ParseLocalConfig<SportlinkRow, LocalFile> = {
    skipEmptyLines: true,
    dynamicTyping: true,
    quoteChar: '"',
    delimiter: ';',
    header: true,
    transformHeader: trimSpacesAndRemoveDoubleQuotes,
    transform: trimSpacesAndRemoveDoubleQuotes,
    complete: (results: Papa.ParseResult<SportlinkRow>) => {
      if (results.errors && results.errors.length > 0) {
        reject(results.errors)
      } else {
        resolve(results.data)
      }
    }
  }

  Papa.parse<SportlinkRow, LocalFile>(file, config)
})
