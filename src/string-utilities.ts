const regexGender = /Meisjes|Jongens|Vrouwen|Mannen/
export const stripGender = (categorie: string) => {
  if (categorie === null || categorie === undefined) {
    return ''
  }
  return categorie.replace(regexGender, '').trim()
}

export const isNullOrEmpty = (text: string) => text === undefined || text === null || text.length <= 0
export const trimSpacesAndRemoveDoubleQuotes = (text: string) => text.trim().split('"').join('')
