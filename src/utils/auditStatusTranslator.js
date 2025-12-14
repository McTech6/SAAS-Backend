import { MESSAGES } from './messages.js';

export const translateStatus = (statusEnum, lang) => {
  const key = `AUDIT_STATUS_${statusEnum.toUpperCase().replace(/ /g,'_')}`;
  return MESSAGES[key]?.[lang] || statusEnum;
};