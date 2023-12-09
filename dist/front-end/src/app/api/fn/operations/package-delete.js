"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageDelete = void 0;
/* tslint:disable */
/* eslint-disable */
const http_1 = require("@angular/common/http");
const operators_1 = require("rxjs/operators");
const request_builder_1 = require("../../request-builder");
function packageDelete(http, rootUrl, params, context) {
    const rb = new request_builder_1.RequestBuilder(rootUrl, packageDelete.PATH, 'delete');
    if (params) {
        rb.path('id', params.id, {});
        rb.header('X-Authorization', params['X-Authorization'], {});
    }
    return http.request(rb.build({ responseType: 'text', accept: '*/*', context })).pipe((0, operators_1.filter)((r) => r instanceof http_1.HttpResponse), (0, operators_1.map)((r) => {
        return r.clone({ body: undefined });
    }));
}
exports.packageDelete = packageDelete;
packageDelete.PATH = '/package/{id}';
