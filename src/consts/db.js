export const collections = {
    views: "views",
    viewsTemplates: "views_templates",
    viewsRoutes: "views_routes"
};

const tet = {
    views: [{
        viewId: "guid",
        viewName: "string",
        instances: {
            id: "guid",
            name: "string",
            styles: "this style will be added to the template styles",
            js: null,
            content: {
                header: "Holidays from Bristol Airport",
                subHeader: `<p>Fly to an array of incredible destinations from Bristol airport this year. Unroll your beach mat and lie out under sunny skies in <a href="https://www.easyjet.com/en/holidays/spain/majorca/">Majorca</a> or the <a href="https://www.easyjet.com/en/holidays/portugal/algarve/">Algarve</a>. Or if you fancy throwing some shapes on the dancefloor head to <a href="https://www.easyjet.com/en/holidays/germany/berlin/berlin-city/">Berlin</a> and <a href="https://www.easyjet.com/en/holidays/poland/krakow/krakow-city/">Krakow </a>for nightlife you’ll never want to say goodbye to.</p>`,
                addtionalHtml: `<div>addtionalHtml</div>`
            }
        }
    }],
    viewsTemplates: {
        "viewIdGuid": {
            html: "string of html templates",
            css: "string of css for the template",
            js: "string of javascript for the template if needed"
        },
    }
}