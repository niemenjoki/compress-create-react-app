const formatSizeUnits = (bytes) => {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
  if (bytes > 1) {
    return bytes + ' bytes';
  }
  if (bytes == 1) {
    return bytes + ' byte';
  }
  return '0 bytes';
};

module.exports = formatSizeUnits;
