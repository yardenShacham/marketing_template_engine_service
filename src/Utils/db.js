const ObjectID = require('mongodb').ObjectID;


export const getObjectId = (id) => new ObjectID(id);

export const getQueryId = (id) => ({_id: getObjectId(id)});

export const getInstanceQuery = (viewId, viewInstanceId) =>
    ({_id: getObjectId(viewId), instances: {$elemMatch: getQueryId(viewInstanceId)}});

export const getTemplatesAction = (htmlTemplate, css, js) => {
    let action = {$set: {}};
    if (htmlTemplate)
        action.$set.html = htmlTemplate;
    if (css)
        action.$set.styles = css;
    if (js)
        action.$set.js = js;
    return action;
};
