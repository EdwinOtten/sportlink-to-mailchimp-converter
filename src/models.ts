export interface PreviewResult<T> {
    columns: string[]
    rows: T[]
}

export interface OutputResult<T> {
    data: T
    mimetype: string
}

export interface SportlinkRow {
    'E-mail': string
    Roepnaam: string;
    'Tussenvoegsel(s)': string;
    Achternaam: string;
    Leeftijdscategorie: string
    'Lidsoorten vereniging': string;
}

export interface SportlinkContact {
    email: string
    firstname: string
    lastname: string
    tags: string[]
}

export interface MailchimpSubscriber {
    'Email Address': string
    'First Name': string
    'Last Name': string
    Tags: string[]
}

export type MailchimpSubscriberObject = Record<(keyof MailchimpSubscriber), undefined>;