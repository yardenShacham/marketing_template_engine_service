import {
    ELEMENT_TYPES_TO_CODES,
    CODES_TO_ELEMENT_TYPES,
    TYPE_TO_DATA,
    ELEMENT_TYPES_TO_DATA_PREVIEW,
    ELEMENT_TYPES_TO_DATA
} from '../consts/templateEngine';
import {replaceTemplateParams} from '../Utils/string';
import {reduce} from 'lodash';

export class templateEngineService {

    constructor() {
        this.contentParamsRegex = /{{([\s\S]+?)}}/gm;
    }

    compileToContentParams(template) {
        return this.getTemplateParamsList(template).reduce((contentParams, nextParam) => {
            const [propName, type] = nextParam.split(':');
            contentParams[propName] = {
                type: ELEMENT_TYPES_TO_CODES[type],
                data: this.getContentInitData(type)
            };
            return contentParams;
        }, {});
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

    getContentInitData(type) {
        return TYPE_TO_DATA[type] || "";
    }

    getPreviewDataByType(paramName, paramTypeCode, data) {
        return ELEMENT_TYPES_TO_DATA_PREVIEW[paramTypeCode](paramName, data);
    }

    getDataByType(paramName, paramTypeCode, data) {
        return ELEMENT_TYPES_TO_DATA[paramTypeCode](paramName, data);
    }
}