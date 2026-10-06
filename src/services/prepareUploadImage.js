export async function prepareUploadImage(file, type) {
  if (!file.type.startsWith('image/')) throw new Error('Выберите файл изображения');
  const bitmap = await createImageBitmap(file);
  try {
    const maxWidth = type === 'logo' ? 400 : ['hero', 'model'].includes(type) ? 1200 : 1000;
    const scale = Math.min(1, maxWidth / bitmap.width, type === 'logo' ? 400 / bitmap.height : 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.75));
    if (!blob || blob.type !== 'image/webp') throw new Error('Браузер не поддерживает подготовку WebP. Обновите браузер.');
    if (blob.size > 4 * 1024 * 1024) throw new Error('Изображение слишком большое. Выберите фото меньшего размера.');
    return new File([blob], 'upload.webp', { type: 'image/webp' });
  } finally {
    bitmap.close();
  }
}
