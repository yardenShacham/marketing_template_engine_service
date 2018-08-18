import {
    ELEMENT_TYPES_TO_CODES,
    CODES_TO_ELEMENT_TYPES,
    ELEMENT_TYPES_TO_CONTENT_PREVIEW,
    ELEMENT_TYPES_TO_CONTENT
} from '../consts/templateEngine';
import {DEFAULT_DATA_BY_TYPE} from '../consts/instances';
import {replaceTemplateParams} from '../Utils/string';
import {reduce} from 'lodash';

export class templateEngineService {

    constructor() {
        this.contentParamsRegex = /{{([\s\S]+?)}}/gm;
    }

    compileToContentParams(template) {
        return this.getTemplateParamsList(template).reduce((contentParams, nextParam) => {
            const [propName, type] = nextParam.split(':');
            const typeCode = ELEMENT_TYPES_TO_CODES[type];
            contentParams[propName] = {
                type: typeCode,
                data: DEFAULT_DATA_BY_TYPE[typeCode](propName)
            };
            return contentParams;
        }, {});
    }

    compileStyles(styles) {
        return replaceTemplateParams(ELEMENT_TYPES_TO_CODES, styles, "{{param}}");
    }

    compile(contentParams, mteTemplate, isPreview) {
        if (contentParams && mteTemplate) {
            const templateParams = reduce(contentParams, (templateParams, nextParamValue, nextParamName) => {
                const {type: typeCode, data} = nextParamValue;
                templateParams[`${nextParamName}:${CODES_TO_ELEMENT_TYPES[typeCode]}`] = isPreview ?
                    this.getPreviewDataByType(nextParamName, typeCode, data) : getDataByType(nextParamName, typeCode, data);
                return templateParams;
            }, {});

            return replaceTemplateParams(templateParams, mteTemplate, "{{param}}");
        }

        return null;
    }

    getTemplateParamsList(template) {
        let params = [];
        let prop = "";
        while (prop !== null) {
            prop = this.contentParamsRegex.exec(template);
            if (prop !== null)
                params.push(prop[1]);
        }

        return params;
    };

    getPreviewDataByType(paramName, paramTypeCode, data) {
        return ELEMENT_TYPES_TO_CONTENT_PREVIEW[paramTypeCode](paramName, data);
    }

    getDataByType(paramName, paramTypeCode, data) {
        return ELEMENT_TYPES_TO_CONTENT[paramTypeCode](paramName, data);
    }
}