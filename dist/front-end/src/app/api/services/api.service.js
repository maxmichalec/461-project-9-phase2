"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packagesList = exports.ApiService = void 0;
const core_1 = require("@angular/core");
const operators_1 = require("rxjs/operators");
const base_service_1 = require("../base-service");
const create_auth_token_1 = require("../fn/operations/create-auth-token");
const package_by_name_delete_1 = require("../fn/operations/package-by-name-delete");
const package_by_name_get_1 = require("../fn/operations/package-by-name-get");
const package_by_reg_ex_get_1 = require("../fn/operations/package-by-reg-ex-get");
const package_create_1 = require("../fn/operations/package-create");
const package_delete_1 = require("../fn/operations/package-delete");
const package_rate_1 = require("../fn/operations/package-rate");
const package_retrieve_1 = require("../fn/operations/package-retrieve");
const packages_list_1 = require("../fn/operations/packages-list");
Object.defineProperty(exports, "packagesList", { enumerable: true, get: function () { return packages_list_1.packagesList; } });
const package_update_1 = require("../fn/operations/package-update");
const registry_reset_1 = require("../fn/operations/registry-reset");
let ApiService = (() => {
    let _classDecorators = [(0, core_1.Injectable)({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = base_service_1.BaseService;
    var ApiService = _classThis = class extends _classSuper {
        constructor(config, http) {
            super(config, http);
        }
        /**
         * Get the packages from the registry.
         *
         * Get any packages fitting the query.
         * Search for packages satisfying the indicated query.
         *
         * If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
         *
         * The response is paginated; the response header includes the offset to use in the next query.
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packagesList()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packagesList$Response(params, context) {
            return (0, packages_list_1.packagesList)(this.http, this.rootUrl, params, context);
        }
        /**
         * Get the packages from the registry.
         *
         * Get any packages fitting the query.
         * Search for packages satisfying the indicated query.
         *
         * If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
         *
         * The response is paginated; the response header includes the offset to use in the next query.
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packagesList$Response()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packagesList(params, context) {
            return this.packagesList$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Reset the registry.
         *
         * Reset the registry to a system default state.
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `registryReset()` instead.
         *
         * This method doesn't expect any request body.
         */
        registryReset$Response(params, context) {
            return (0, registry_reset_1.registryReset)(this.http, this.rootUrl, params, context);
        }
        /**
         * Reset the registry.
         *
         * Reset the registry to a system default state.
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `registryReset$Response()` instead.
         *
         * This method doesn't expect any request body.
         */
        registryReset(params, context) {
            return this.registryReset$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Interact with the package with this ID.
         *
         * Return this package.
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageRetrieve()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageRetrieve$Response(params, context) {
            return (0, package_retrieve_1.packageRetrieve)(this.http, this.rootUrl, params, context);
        }
        /**
         * Interact with the package with this ID.
         *
         * Return this package.
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageRetrieve$Response()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageRetrieve(params, context) {
            return this.packageRetrieve$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Update this content of the package.
         *
         * The name, version, and ID must match.
         *
         * The package contents (from PackageData) will replace the previous contents.
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageUpdate()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packageUpdate$Response(params, context) {
            return (0, package_update_1.packageUpdate)(this.http, this.rootUrl, params, context);
        }
        /**
         * Update this content of the package.
         *
         * The name, version, and ID must match.
         *
         * The package contents (from PackageData) will replace the previous contents.
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageUpdate$Response()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packageUpdate(params, context) {
            return this.packageUpdate$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Delete this version of the package.
         *
         *
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageDelete()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageDelete$Response(params, context) {
            return (0, package_delete_1.packageDelete)(this.http, this.rootUrl, params, context);
        }
        /**
         * Delete this version of the package.
         *
         *
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageDelete$Response()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageDelete(params, context) {
            return this.packageDelete$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageCreate()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packageCreate$Response(params, context) {
            return (0, package_create_1.packageCreate)(this.http, this.rootUrl, params, context);
        }
        /**
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageCreate$Response()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packageCreate(params, context) {
            return this.packageCreate$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageRate()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageRate$Response(params, context) {
            return (0, package_rate_1.packageRate)(this.http, this.rootUrl, params, context);
        }
        /**
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageRate$Response()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageRate(params, context) {
            return this.packageRate$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Create an access token.
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `createAuthToken()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        createAuthToken$Response(params, context) {
            return (0, create_auth_token_1.createAuthToken)(this.http, this.rootUrl, params, context);
        }
        /**
         * Create an access token.
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `createAuthToken$Response()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        createAuthToken(params, context) {
            return this.createAuthToken$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Return the history of this package (all versions).
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageByNameGet()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageByNameGet$Response(params, context) {
            return (0, package_by_name_get_1.packageByNameGet)(this.http, this.rootUrl, params, context);
        }
        /**
         * Return the history of this package (all versions).
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageByNameGet$Response()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageByNameGet(params, context) {
            return this.packageByNameGet$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Delete all versions of this package.
         *
         *
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageByNameDelete()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageByNameDelete$Response(params, context) {
            return (0, package_by_name_delete_1.packageByNameDelete)(this.http, this.rootUrl, params, context);
        }
        /**
         * Delete all versions of this package.
         *
         *
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageByNameDelete$Response()` instead.
         *
         * This method doesn't expect any request body.
         */
        packageByNameDelete(params, context) {
            return this.packageByNameDelete$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
        /**
         * Get any packages fitting the regular expression.
         *
         * Search for a package using regular expression over package names
         * and READMEs. This is similar to search by name.
         *
         * This method provides access to the full `HttpResponse`, allowing access to response headers.
         * To access only the response body, use `packageByRegExGet()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packageByRegExGet$Response(params, context) {
            return (0, package_by_reg_ex_get_1.packageByRegExGet)(this.http, this.rootUrl, params, context);
        }
        /**
         * Get any packages fitting the regular expression.
         *
         * Search for a package using regular expression over package names
         * and READMEs. This is similar to search by name.
         *
         * This method provides access only to the response body.
         * To access the full response (for headers, for example), `packageByRegExGet$Response()` instead.
         *
         * This method sends `application/json` and handles request body of type `application/json`.
         */
        packageByRegExGet(params, context) {
            return this.packageByRegExGet$Response(params, context).pipe((0, operators_1.map)((r) => r.body));
        }
    };
    __setFunctionName(_classThis, "ApiService");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ApiService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    /** Path part for operation `packagesList()` */
    _classThis.PackagesListPath = '/packages';
    /** Path part for operation `registryReset()` */
    _classThis.RegistryResetPath = '/reset';
    /** Path part for operation `packageRetrieve()` */
    _classThis.PackageRetrievePath = '/package/{id}';
    /** Path part for operation `packageUpdate()` */
    _classThis.PackageUpdatePath = '/package/{id}';
    /** Path part for operation `packageDelete()` */
    _classThis.PackageDeletePath = '/package/{id}';
    /** Path part for operation `packageCreate()` */
    _classThis.PackageCreatePath = '/package';
    /** Path part for operation `packageRate()` */
    _classThis.PackageRatePath = '/package/{id}/rate';
    /** Path part for operation `createAuthToken()` */
    _classThis.CreateAuthTokenPath = '/authenticate';
    /** Path part for operation `packageByNameGet()` */
    _classThis.PackageByNameGetPath = '/package/byName/{name}';
    /** Path part for operation `packageByNameDelete()` */
    _classThis.PackageByNameDeletePath = '/package/byName/{name}';
    /** Path part for operation `packageByRegExGet()` */
    _classThis.PackageByRegExGetPath = '/package/byRegEx';
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ApiService = _classThis;
})();
exports.ApiService = ApiService;
