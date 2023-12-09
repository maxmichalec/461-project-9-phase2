"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageByNameDelete = void 0;
/* tslint:disable */
/* eslint-disable */
const http_1 = require("@angular/common/http");
const operators_1 = require("rxjs/operators");
const request_builder_1 = require("../../request-builder");
function packageByNameDelete(http, rootUrl, params, context) {
    const rb = new request_builder_1.RequestBuilder(rootUrl, packageByNameDelete.PATH, 'delete');
    if (params) {
        rb.path('name', params.name, {});
        rb.header('X-Authorization', params['X-Authorization'], {});
    }
    return http.request(rb.build({ responseType: 'text', accept: '*/*', context })).pipe((0, operators_1.filter)((r) => r instanceof http_1.HttpResponse), (0, operators_1.map)((r) => {
        return r.clone({ body: undefined });
    }));
}
exports.packageByNameDelete = packageByNameDelete;
packageByNameDelete.PATH = '/package/byName/{name}';
