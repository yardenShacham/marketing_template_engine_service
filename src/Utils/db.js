export const getInstanceQuery = (viewId, viewInstanceId) =>
    ({_id: viewId, instances: {$elemMatch: {id: viewInstanceId}}});

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
