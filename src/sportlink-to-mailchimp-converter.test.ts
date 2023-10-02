/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {describe, expect, test} from '@jest/globals'
import { SportlinkToMailchimpConverter } from './sportlink-to-mailchimp-converter'

class MockFile {
    constructor ({ name = 'mock.jpg', size = 1024, type = 'image/jpg', lastModified = new Date() }) {
      const blob = new Blob(['a'.repeat(size)], { type }) as any
      blob.lastModifiedDate = lastModified
  
      return new File([blob as Blob], name)
    }
  }

  const file = new MockFile({})

test('the data is peanut butter', async () => {
    await expect(SportlinkToMailchimpConverter.convertFileToPreview(file)).resolves.toBe('peanut butter')
})