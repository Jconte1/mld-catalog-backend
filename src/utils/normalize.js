
export default function normalize(value) {
    return value?.toLowerCase().replace(/-/g, ' ').trim();
  }