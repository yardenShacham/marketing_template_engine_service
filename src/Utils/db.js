const ObjectID = require('mongodb').ObjectID;


export const getObjectId = (id) => new ObjectID(id);

export const getQueryId = (id) => ({_id: getObjectId(id)});

export const getInstanceQuery = (viewId, viewInstanceId) =>
    ({_id: getObjectId(viewId), instances: {$elemMatch: getQueryId(viewInstanceId)}});

export const getTemplatesAction = ({htmlTemplate, styles, js}) => {
    let action = {$set: {}};
    if (htmlTemplate)
        action.$set.html = htmlTemplate;
    if (styles)
        action.$set.styles = styles;
    if (js)
        action.$set.js = js;
    return action;
};
