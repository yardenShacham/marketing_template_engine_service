export const replaceAt = (str, index, char) => str.substr(0, index) + char + str.substr(index + 1);
export const insertAt = (str, insertStr, index) => str.slice(0, index) + insertStr + str.slice(index);