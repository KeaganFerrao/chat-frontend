export function formatTimeShort(isoTime) {
    if (!isoTime) return '';
    const date = new Date(isoTime);
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    const day = String(date.getDate()).padStart(2, '0');
    const monthShort = date.toLocaleString('default', { month: 'short' });
  
    return `${hours}:${minutes}, ${day} ${monthShort}`;
}

export function ucFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
  