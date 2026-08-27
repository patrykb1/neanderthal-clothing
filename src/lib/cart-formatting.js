export function formatOptionKey(key) {
  const words = String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .toLowerCase();

  return words ? words.charAt(0).toUpperCase() + words.slice(1) : '';
}

export function formatOptionValue(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  return value.label || value.name || value.value || value.hex || value.id || '';
}

export function formatCartOption(key, value, separator = ': ') {
  return `${formatOptionKey(key)}${separator}${formatOptionValue(value)}`;
}
