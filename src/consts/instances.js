import {ELEMENT_TYPES_TO_CODES} from './templateEngine';

export const DEFAULT_DATA_BY_TYPE = {
    [ELEMENT_TYPES_TO_CODES.text]: (paramName) => `Edit ${paramName}`,
    [ELEMENT_TYPES_TO_CODES.container]: (paramName) => `Edit ${paramName}`,
    [ELEMENT_TYPES_TO_CODES.image]: () => "https://www.georeferencer.com/static/img/presentation/homepage/1.png",
    [ELEMENT_TYPES_TO_CODES.list]: () => []
};