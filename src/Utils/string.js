export const replaceAt = (str, index, char) => str.substr(0, index) + char + str.substr(index + 1);
export const insertAt = (str, insertStr, index) => str.slice(0, index) + insertStr + str.slice(index);

export const getTemplateParams = (htmlTemplate) => {
    let params = [];
    const regex = /{{([\s\S]+?)}}/gm;
    let prop = "";
    while (prop !== null) {
        prop = regex.exec(htmlTemplate);
        if (prop !== null)
            params.push(prop[1]);
    }

    return params;
};