export const formatDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatBytes = (bytes) => {
  if (bytes === 0 || bytes === undefined) return '0 B';
  const k = 1000;
  const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const convertedValue = (bytes / Math.pow(k, i)).toFixed(2);
  return `${convertedValue} ${sizes[i]} (${bytes})`;
};

export const formatNumber = (number) => {
  if (number === undefined || number === null) return 'N/A';
  if (typeof number === 'string') return number;
  if (number >= 1000000) {
    const millions = number / 1000000;
    return `${millions.toFixed(2)}MM (${number})`;
  }
  return number.toString();
};

export const formatMinutesToK = (minutes) => {
  if (minutes === undefined || minutes === null) return 'N/A';
  const kValue = minutes / 1000;
  if (kValue < 1) {
    return `${kValue.toFixed(3)}k`;
  } else {
    return `${kValue.toFixed(2)}k`;
  }
};

export const formatImagesTransformations = (number) => {
  if (number === undefined || number === null) return 'N/A';
  if (typeof number === 'string') return number;
  
  const kValue = number / 1000;
  if (kValue < 1) {
    return `${kValue.toFixed(3)}k (${number})`;
  } else {
    return `${kValue.toFixed(2)}k (${number})`;
  }
};

export const formatStreamMinutes = (minutes) => {
  if (minutes === undefined || minutes === null) return 'N/A';
  if (typeof minutes === 'string') return minutes;
  
  const kValue = minutes / 1000;
  if (kValue < 1) {
    return `${kValue.toFixed(3)}k (${minutes.toLocaleString()})`;
  } else {
    return `${kValue.toFixed(2)}k (${minutes.toLocaleString()})`;
  }
};

export const formatCPUTime = (microseconds) => {
  if (microseconds === undefined || microseconds === null) return 'N/A';
  const milliseconds = microseconds / 1000;
  const millions = milliseconds / 1000000;
  return `${millions.toFixed(2)}MM ms (${milliseconds.toLocaleString()} ms)`;
};
