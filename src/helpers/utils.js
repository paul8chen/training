import config from '../config.js';

export const getNextDate = (date) => {
  const currentDate = new Date(date).getDate();
  const nextDateTimestamp = new Date(date).setDate(currentDate + 1);
  const nextDate = new Date(nextDateTimestamp).toISOString();
  return nextDate;
};

export const getTransFormedTZDate = (date) => {
  const currentHour = new Date(date).getHours();
  const transformedTZTimestamp = new Date(date).setHours(
    currentHour + config.TIMEZONE_OFFSET
  );
  const transFormedTZDate = new Date(transformedTZTimestamp).toISOString();
  return transFormedTZDate;
};

export const firstLetterUpperCase = (str) =>
  str
    .toLowerCase()
    .split(' ')
    .map((el) => el[0].toUpperCase() + el.slice(1))
    .join(' ');

export const objectDatesToIsoString = (objs) => {
  objs.forEach((obj) => {
    objectDateToIsoString(obj);
  });
};

export const calTotalPage = (itemPerPage, totalCount) => {
  const division = Math.floor(totalCount / itemPerPage);
  const remain = totalCount % itemPerPage;
  return remain ? division + 1 : division;
};

export const serialize = (data) => {
  const serializedData = {};
  for (const [key, value] of Object.entries(data)) {
    serializedData[key] =
      value instanceof Object ? JSON.stringify(value) : `${value}`;
  }

  return serializedData;
};

export const deserialize = (data) => {
  const deserializedData = {};
  for (const [key, value] of Object.entries(data)) {
    try {
      deserializedData[key] = JSON.parse(value);
    } catch (err) {
      deserializedData[key] = value;
    }
  }

  return deserializedData;
};

export const waiting = async (second) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000 * second);
  });
};

function objectDateToIsoString(obj) {
  if (obj.created_at) obj.created_at = obj.created_at.toISOString();
  if (obj.updated_at) obj.updated_at = obj.updated_at.toISOString();
}
