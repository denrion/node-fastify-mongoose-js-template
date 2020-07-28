const setCorrectPluralSuffix = (string) => {
  const suffix =
    string.endsWith('ch') || string.endsWith('sh') || string.endsWith('x')
      ? 'es'
      : string.endsWith('s')
      ? 'ses'
      : string.endsWith('z')
      ? 'zes'
      : 's';

  return `${string}${suffix}`;
};

module.exports = setCorrectPluralSuffix;
