/** Convert product/category names into URL-safe slugs, e.g. "Laptop ASUS TUF" -> "laptop-asus-tuf" */
export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function productSlug(product) {
  if (!product) return '';
  return slugify(product.name) || slugify(product.id);
}

export function productPath(product) {
  const slug = productSlug(product);
  return slug ? `/${slug}` : '/';
}

export function categoryPath(categoryId) {
  if (!categoryId || categoryId === 'all') return '/';
  return `/${categoryId}`;
}
