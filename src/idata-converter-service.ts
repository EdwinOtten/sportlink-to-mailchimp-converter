export interface IDataConverterService {

  inputFileExtensions: string[];

  labels: {
    title: string,
    subtitle: string,
    sourceStep: {
      title: string,
      description: string
    },
    previewStep: {
      title: string,
      description: string
    },
    outputStep: {
      title: string,
      description: string
    }
  };

  convertFileToPreview(file: File): Promise<PreviewResult>;
  convertFileToOutput(file: File): Promise<OutputResult>;
}

export interface PreviewResult {
  columns: string[];
  rows: any;
}

export interface OutputResult {
  data: any;
  filename: string;
  mimetype: string;
}
