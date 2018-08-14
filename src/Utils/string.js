export const replaceAt = (str, index, char) => str.substr(0, index) + char + str.substr(index + 1);
export const insertAt = (str, insertStr, index) => str.slice(0, index) + insertStr + str.slice(index);

export const replaceTemplateParams = (templateParams, str, contentParamsRegex) => {
    if (templateParams) {
        const getCurrentRegex = (param) => new RegExp(contentParamsRegex.replace('param', param), 'g');
        const params = Object.keys(templateParams);
        return params.reduce((strTemplate, nextParam) => {
            const currentRegex = getCurrentRegex(nextParam);
            return strTemplate.replace(currentRegex, templateParams[nextParam]);
        }, str);
    }
    return null;
};