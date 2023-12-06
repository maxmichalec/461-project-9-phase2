"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBuilder = void 0;
/* tslint:disable */
/* eslint-disable */
const http_1 = require("@angular/common/http");
/**
 * Custom parameter codec to correctly handle the plus sign in parameter
 * values. See https://github.com/angular/angular/issues/18261
 */
class ParameterCodec {
    encodeKey(key) {
        return encodeURIComponent(key);
    }
    encodeValue(value) {
        return encodeURIComponent(value);
    }
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}
const ParameterCodecInstance = new ParameterCodec();
/**
 * Base class for a parameter
 */
class Parameter {
    constructor(name, value, options, defaultStyle, defaultExplode) {
        this.name = name;
        this.value = value;
        this.options = options;
        this.options = options || {};
        if (this.options.style === null || this.options.style === undefined) {
            this.options.style = defaultStyle;
        }
        if (this.options.explode === null || this.options.explode === undefined) {
            this.options.explode = defaultExplode;
        }
    }
    serializeValue(value, separator = ',') {
        if (value === null || value === undefined) {
            return '';
        }
        else if (value instanceof Array) {
            return value.map(v => this.serializeValue(v).split(separator).join(encodeURIComponent(separator))).join(separator);
        }
        else if (typeof value === 'object') {
            const array = [];
            for (const key of Object.keys(value)) {
                let propVal = value[key];
                if (propVal !== null && propVal !== undefined) {
                    propVal = this.serializeValue(propVal).split(separator).join(encodeURIComponent(separator));
                    if (this.options.explode) {
                        array.push(`${key}=${propVal}`);
                    }
                    else {
                        array.push(key);
                        array.push(propVal);
                    }
                }
            }
            return array.join(separator);
        }
        else {
            return String(value);
        }
    }
}
/**
 * A parameter in the operation path
 */
class PathParameter extends Parameter {
    constructor(name, value, options) {
        super(name, value, options, 'simple', false);
    }
    append(path) {
        let value = this.value;
        if (value === null || value === undefined) {
            value = '';
        }
        let prefix = this.options.style === 'label' ? '.' : '';
        let separator = this.options.explode ? prefix === '' ? ',' : prefix : ',';
        let alreadySerialized = false;
        if (this.options.style === 'matrix') {
            // The parameter name is just used as prefix, except in some cases...
            prefix = `;${this.name}=`;
            if (this.options.explode && typeof value === 'object') {
                prefix = ';';
                if (value instanceof Array) {
                    // For arrays we have to repeat the name for each element
                    value = value.map(v => `${this.name}=${this.serializeValue(v, ';')}`);
                    value = value.join(';');
                    alreadySerialized = true;
                }
                else {
                    // For objects we have to put each the key / value pairs
                    value = this.serializeValue(value, ';');
                    alreadySerialized = true;
                }
            }
        }
        value = prefix + (alreadySerialized ? value : this.serializeValue(value, separator));
        // Replace both the plain variable and the corresponding variant taking in the prefix and explode into account
        path = path.replace(`{${this.name}}`, value);
        path = path.replace(`{${prefix}${this.name}${this.options.explode ? '*' : ''}}`, value);
        return path;
    }
    // @ts-ignore
    serializeValue(value, separator = ',') {
        var result = typeof value === 'string' ? encodeURIComponent(value) : super.serializeValue(value, separator);
        result = result.replace(/%3D/g, '=');
        result = result.replace(/%3B/g, ';');
        result = result.replace(/%2C/g, ',');
        return result;
    }
}
/**
 * A parameter in the query
 */
class QueryParameter extends Parameter {
    constructor(name, value, options) {
        super(name, value, options, 'form', true);
    }
    append(params) {
        if (this.value instanceof Array) {
            // Array serialization
            if (this.options.explode) {
                for (const v of this.value) {
                    params = params.append(this.name, this.serializeValue(v));
                }
            }
            else {
                const separator = this.options.style === 'spaceDelimited'
                    ? ' ' : this.options.style === 'pipeDelimited'
                    ? '|' : ',';
                return params.append(this.name, this.serializeValue(this.value, separator));
            }
        }
        else if (this.value !== null && typeof this.value === 'object') {
            // Object serialization
            if (this.options.style === 'deepObject') {
                // Append a parameter for each key, in the form `name[key]`
                for (const key of Object.keys(this.value)) {
                    const propVal = this.value[key];
                    if (propVal !== null && propVal !== undefined) {
                        params = params.append(`${this.name}[${key}]`, this.serializeValue(propVal));
                    }
                }
            }
            else if (this.options.explode) {
                // Append a parameter for each key without using the parameter name
                for (const key of Object.keys(this.value)) {
                    const propVal = this.value[key];
                    if (propVal !== null && propVal !== undefined) {
                        params = params.append(key, this.serializeValue(propVal));
                    }
                }
            }
            else {
                // Append a single parameter whose values are a comma-separated list of key,value,key,value...
                const array = [];
                for (const key of Object.keys(this.value)) {
                    const propVal = this.value[key];
                    if (propVal !== null && propVal !== undefined) {
                        array.push(key);
                        array.push(propVal);
                    }
                }
                params = params.append(this.name, this.serializeValue(array));
            }
        }
        else if (this.value !== null && this.value !== undefined) {
            // Plain value
            params = params.append(this.name, this.serializeValue(this.value));
        }
        return params;
    }
}
/**
 * A parameter in the HTTP request header
 */
class HeaderParameter extends Parameter {
    constructor(name, value, options) {
        super(name, value, options, 'simple', false);
    }
    append(headers) {
        if (this.value !== null && this.value !== undefined) {
            if (this.value instanceof Array) {
                for (const v of this.value) {
                    headers = headers.append(this.name, this.serializeValue(v));
                }
            }
            else {
                headers = headers.append(this.name, this.serializeValue(this.value));
            }
        }
        return headers;
    }
}
/**
 * Helper to build http requests from parameters
 */
class RequestBuilder {
    constructor(rootUrl, operationPath, method) {
        this.rootUrl = rootUrl;
        this.operationPath = operationPath;
        this.method = method;
        this._path = new Map();
        this._query = new Map();
        this._header = new Map();
    }
    /**
     * Sets a path parameter
     */
    path(name, value, options) {
        this._path.set(name, new PathParameter(name, value, options || {}));
    }
    /**
     * Sets a query parameter
     */
    query(name, value, options) {
        this._query.set(name, new QueryParameter(name, value, options || {}));
    }
    /**
     * Sets a header parameter
     */
    header(name, value, options) {
        this._header.set(name, new HeaderParameter(name, value, options || {}));
    }
    /**
     * Sets the body content, along with the content type
     */
    body(value, contentType = 'application/json') {
        if (value instanceof Blob) {
            this._bodyContentType = value.type;
        }
        else {
            this._bodyContentType = contentType;
        }
        if (this._bodyContentType === 'application/x-www-form-urlencoded' && value !== null && typeof value === 'object') {
            // Handle URL-encoded data
            const pairs = [];
            for (const key of Object.keys(value)) {
                let val = value[key];
                if (!(val instanceof Array)) {
                    val = [val];
                }
                for (const v of val) {
                    const formValue = this.formDataValue(v);
                    if (formValue !== null) {
                        pairs.push([key, formValue]);
                    }
                }
            }
            this._bodyContent = pairs.map(p => `${encodeURIComponent(p[0])}=${encodeURIComponent(p[1])}`).join('&');
        }
        else if (this._bodyContentType === 'multipart/form-data') {
            // Handle multipart form data
            const formData = new FormData();
            if (value !== null && value !== undefined) {
                for (const key of Object.keys(value)) {
                    const val = value[key];
                    if (val instanceof Array) {
                        for (const v of val) {
                            const toAppend = this.formDataValue(v);
                            if (toAppend !== null) {
                                formData.append(key, toAppend);
                            }
                        }
                    }
                    else {
                        const toAppend = this.formDataValue(val);
                        if (toAppend !== null) {
                            formData.set(key, toAppend);
                        }
                    }
                }
            }
            this._bodyContent = formData;
        }
        else {
            // The body is the plain content
            this._bodyContent = value;
        }
    }
    formDataValue(value) {
        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Blob) {
            return value;
        }
        if (typeof value === 'object') {
            return new Blob([JSON.stringify(value)], { type: 'application/json' });
        }
        return String(value);
    }
    /**
     * Builds the request with the current set parameters
     */
    build(options) {
        options = options || {};
        // Path parameters
        let path = this.operationPath;
        for (const pathParam of this._path.values()) {
            path = pathParam.append(path);
        }
        const url = this.rootUrl + path;
        // Query parameters
        let httpParams = new http_1.HttpParams({
            encoder: ParameterCodecInstance
        });
        for (const queryParam of this._query.values()) {
            httpParams = queryParam.append(httpParams);
        }
        // Header parameters
        let httpHeaders = new http_1.HttpHeaders();
        if (options.accept) {
            httpHeaders = httpHeaders.append('Accept', options.accept);
        }
        for (const headerParam of this._header.values()) {
            httpHeaders = headerParam.append(httpHeaders);
        }
        // Request content headers
        if (this._bodyContentType && !(this._bodyContent instanceof FormData)) {
            httpHeaders = httpHeaders.set('Content-Type', this._bodyContentType);
        }
        // Perform the request
        return new http_1.HttpRequest(this.method.toUpperCase(), url, this._bodyContent, {
            params: httpParams,
            headers: httpHeaders,
            responseType: options.responseType,
            reportProgress: options.reportProgress,
            context: options.context
        });
    }
}
exports.RequestBuilder = RequestBuilder;
