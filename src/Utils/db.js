export const getInstanceQuery = (viewId, viewInstanceId) =>
    ({_id: viewId, instances: {$elemMatch: {id: viewInstanceId}}});


