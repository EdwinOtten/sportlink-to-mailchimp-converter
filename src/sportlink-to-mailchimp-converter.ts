/**
 * A DataConverterService that helps to convert a Sportlink export into a file that can be imported into Mailchimp.
 */

import * as Papa from 'papaparse';

export class SportlinkToMailchimpConverter {

  static async convertFileToPreview(file: File): Promise<PreviewResult> {
    const parseResult = await parseData(file);
    const data = parseResult.data.map(row => ({
        'Email Address': row['E-mail'],
        'First Name': row.Roepnaam,
        'Last Name': (((row['Tussenvoegsel(s)'] ? row['Tussenvoegsel(s)'] : '') + ' ' + row.Achternaam) as string).trim(),
        'Tags': 'not yet implemented'
      }));

    return {
      columns: Object.getOwnPropertyNames(data[0]),
      rows: data
    };
  }

  static async convertFileToOutput(file: File): Promise<OutputResult> {
    const data = await this.convertFileToPreview(file);
    const csvData = Papa.unparse(data.rows, {
      quotes: true
    });

    const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
    return {
      mimetype: 'text/csv;charset=utf-8;',
      filename: originalFilename + '_converted_to_mailchimp.csv',
      data: csvData
    };
  }
}

const parseData = async(file: File): Promise<Papa.ParseResult> => {
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
    });
  });
}

interface PreviewResult {
  columns: string[];
  rows: any;
}

interface OutputResult {
  data: any;
  filename: string;
  mimetype: string;
}
