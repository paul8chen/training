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
