"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthToken = void 0;
/* tslint:disable */
/* eslint-disable */
const http_1 = require("@angular/common/http");
const operators_1 = require("rxjs/operators");
const request_builder_1 = require("../../request-builder");
function createAuthToken(http, rootUrl, params, context) {
    const rb = new request_builder_1.RequestBuilder(rootUrl, createAuthToken.PATH, 'put');
    if (params) {
        rb.body(params.body, 'application/json');
    }
    return http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe((0, operators_1.filter)((r) => r instanceof http_1.HttpResponse), (0, operators_1.map)((r) => {
        return r;
    }));
}
exports.createAuthToken = createAuthToken;
createAuthToken.PATH = '/authenticate';
