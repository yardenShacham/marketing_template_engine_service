export const ELEMENT_TYPES_TO_CODES = {
    container: 1,
    image: 2,
    text: 3,
    list: 4
};

export const CODES_TO_ELEMENT_TYPES = {
    1: "container",
    2: "image",
    3: "text",
    4: "list"
};

export const ELEMENT_TYPES_TO_CONTENT = {
    [ELEMENT_TYPES_TO_CODES.container]: (propName, data) => `<div class='${`${propName}-conatiner`}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.text]: (propName, data) => `<div class='${propName}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.image]: (propName, data) => `<img class='${propName}' src="${data}" />`
};
export const ELEMENT_TYPES_TO_CONTENT_PREVIEW = {
    [ELEMENT_TYPES_TO_CODES.container]: (propName, data) => `<div class='${`${propName}-${ELEMENT_TYPES_TO_CODES.container}`}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.text]: (propName, data) => `<div class='${`${propName}-${ELEMENT_TYPES_TO_CODES.text}`}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.image]: (propName, data) => `<div class='${`${propName}-${ELEMENT_TYPES_TO_CODES.image}`}'>${data}</div>`
};