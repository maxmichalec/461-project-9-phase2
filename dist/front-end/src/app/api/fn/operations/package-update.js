"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageUpdate = void 0;
/* tslint:disable */
/* eslint-disable */
const http_1 = require("@angular/common/http");
const operators_1 = require("rxjs/operators");
const request_builder_1 = require("../../request-builder");
function packageUpdate(http, rootUrl, params, context) {
    const rb = new request_builder_1.RequestBuilder(rootUrl, packageUpdate.PATH, 'put');
    if (params) {
        rb.path('id', params.id, {});
        rb.header('X-Authorization', params['X-Authorization'], {});
        rb.body(params.body, 'application/json');
    }
    return http.request(rb.build({ responseType: 'text', accept: '*/*', context })).pipe((0, operators_1.filter)((r) => r instanceof http_1.HttpResponse), (0, operators_1.map)((r) => {
        return r.clone({ body: undefined });
    }));
}
exports.packageUpdate = packageUpdate;
packageUpdate.PATH = '/package/{id}';
