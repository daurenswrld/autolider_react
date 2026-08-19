/**
 * Converts any Russian/Kazakh/English string to a clean SEO-friendly slug
 * Example: "Шины и диски" -> "shiny-i-diski"
 * Example: "Mercedes-Benz E-Class W124" -> "mercedes-benz-e-class-w124"
 */
export function slugify(text) {
  if (!text) return '';

  const charMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u', 'h': 'h'
  };

  return text
    .toString()
    .toLowerCase()
    .trim()
    .split('')
    .map((char) => charMap[char] || char)
    .join('')
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-alphanumeric chars
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Trim hyphens from start
    .replace(/-+$/, '');         // Trim hyphens from end
}

/**
 * Returns a unique slug for a model inside a brand's models array.
 * If model has an explicit .slug property, uses that.
 * Otherwise, if earlier models in the array generate the same base slug,
 * appends -2, -3, etc.
 * Example:
 * 1st "Destroyer" -> "destroyer"
 * 2nd "Destroyer" -> "destroyer-2"
 */
export function getUniqueModelSlug(model, index, allModels) {
  if (!model) return '';
  if (model.slug) return model.slug;

  const baseSlug = slugify(model.name);
  if (!allModels || !Array.isArray(allModels) || index === undefined || index === null) {
    return baseSlug;
  }

  let occurrences = 0;
  for (let i = 0; i < index; i++) {
    const earlierModel = allModels[i];
    const earlierBase = earlierModel.slug || slugify(earlierModel.name);
    if (earlierBase === baseSlug || slugify(earlierModel.name) === baseSlug) {
      occurrences++;
    }
  }

  return occurrences === 0 ? baseSlug : `${baseSlug}-${occurrences + 1}`;
}
