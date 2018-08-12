export const ELEMENT_TYPES_TO_CODES = {
    container: "CONTAINER",
    image: "img",
    text: "TEXT",
    list: "Array"
};

export const CODES_TO_ELEMENT_TYPES = {
    CONTAINER: "container",
    img: "image",
    TEXT: "text",
    Array: "list"
};

export const ELEMENT_TYPES_TO_DATA = {
    [ELEMENT_TYPES_TO_CODES.container]: (propName, data) => `<div class='${`${propName}-conatiner`}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.text]: (propName, data) => `<div class='${propName}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.image]: (propName, data) => `<img class='${propName}' src="${data}" />`
};
export const ELEMENT_TYPES_TO_DATA_PREVIEW = {
    [ELEMENT_TYPES_TO_CODES.container]: (propName, data) => `<div class='${`${propName}-conatiner`}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.text]: (propName, data) => `<div class='${`${propName}-text`}'>${data}</div>`,
    [ELEMENT_TYPES_TO_CODES.image]: (propName, data) => `<div class='${`${propName}-image`}'>${data}</div>`
};

export const TYPE_TO_DATA = {
    [ELEMENT_TYPES.list]: []
};