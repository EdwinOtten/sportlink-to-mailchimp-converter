import { stripGender, isNullOrEmpty, trimSpacesAndRemoveDoubleQuotes } from './string-utilities'

describe('stripGender', () => {
  it('should remove gender-related words and trim the string', () => {
    expect(stripGender('Meisjes kleding')).toBe('kleding')
    expect(stripGender('Jongens schoenen')).toBe('schoenen')
    expect(stripGender('Vrouwen accessoires')).toBe('accessoires')
    expect(stripGender('Mannen horloges')).toBe('horloges')
    expect(stripGender('Unisex kleding')).toBe('Unisex kleding') // No gender-related word
  })
})

describe('isNullOrEmpty', () => {
  it('should return true for undefined, null, or empty strings', () => {
    expect(isNullOrEmpty(undefined!)).toBe(true)
    expect(isNullOrEmpty(null!)).toBe(true)
    expect(isNullOrEmpty('')).toBe(true)
  })

  it('should return false for non-empty strings', () => {
    expect(isNullOrEmpty('text')).toBe(false)
    expect(isNullOrEmpty(' ')).toBe(false)
  })
})

describe('trimSpacesAndRemoveDoubleQuotes', () => {
  it('should trim spaces and remove double quotes', () => {
    expect(trimSpacesAndRemoveDoubleQuotes(' "text" ')).toBe('text')
    expect(trimSpacesAndRemoveDoubleQuotes(' "text')).toBe('text')
    expect(trimSpacesAndRemoveDoubleQuotes('text" ')).toBe('text')
    expect(trimSpacesAndRemoveDoubleQuotes('text')).toBe('text')
  })

  it('should handle empty strings', () => {
    expect(trimSpacesAndRemoveDoubleQuotes('')).toBe('')
  })
})
