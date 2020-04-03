/**
 * A DataConverterService that helps to convert a Sportlink export into a file that can be imported into Mailchimp.
 */

import * as Papa from 'papaparse';
import { IDataConverterService, OutputResult, PreviewResult } from './idata-converter-service';

export class DataConverterConfigService implements IDataConverterService {

  inputFileExtensions = ['.csv'];

  labels = {
    title: 'Sportlink to Mailchimp converter',
    subtitle: 'A tool to convert a Sportlink export into a file that can be imported into Mailchimp.',
    sourceStep: {
      title: 'Sportlink source',
      description: ''
    },
    previewStep: {
      title: 'Result preview',
      description: 'Check out the preview below before exporting the result.'
    },
    outputStep: {
      title: 'Mailchimp output',
      description: 'Import this into mailchimp'
    }
  };

  async convertFileToPreview(file: File): Promise<PreviewResult> {
    const parseResult = await this.parseData(file);
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

  async convertFileToOutput(file: File): Promise<OutputResult> {
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

  private async parseData(file: File): Promise<Papa.ParseResult> {
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
}
