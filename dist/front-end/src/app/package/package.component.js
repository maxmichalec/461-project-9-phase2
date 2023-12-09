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
exports.PackageComponent = void 0;
/*
 * File: package.component.ts
 * Author: Madi Arnold
 * Description: The package component for the /package endpoint with the logic for the front-end
 */
const core_1 = require("@angular/core");
let PackageComponent = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-package',
            templateUrl: './package.component.html',
            styleUrls: ['./package.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PackageComponent = _classThis = class {
        constructor(apiService) {
            this.apiService = apiService;
            this.authHeader = 'YOUR_AUTH_TOKEN_HERE';
            this.deletePackageId = ''; //User input for deletePackage
            this.packageId = ''; //User input for getPackage
            this.getPackageData = {
                data: {
                    Content: '',
                    URL: '',
                    JSProgram: ''
                },
                metadata: {
                    Name: '',
                    Version: '',
                    ID: ''
                }
            };
            this.packageData = {
                data: {
                    Content: '',
                    URL: '',
                    JSProgram: ''
                },
                metadata: {
                    Name: '',
                    Version: '',
                    ID: ''
                }
            };
            this.updateMessage = '';
            this.deleteMessage = '';
            this.postPackageData = {
                Content: '',
                URL: '',
                JSProgram: '',
            };
            this.postPackageDataResponse = {
                data: {
                    Content: '',
                    URL: '',
                    JSProgram: ''
                },
                metadata: {
                    Name: '',
                    Version: '',
                    ID: ''
                }
            };
            this.ratePackageId = ''; //User input for ratePacakge
            this.ratePackageResponse = {
                BusFactor: 0,
                Correctness: 0,
                GoodPinningPractice: 0,
                LicenseScore: 0,
                NetScore: 0,
                PullRequest: 0,
                RampUp: 0,
                ResponsiveMaintainer: 0
            };
        }
        handleFileInput(event) {
            const file = event.target.files[0];
            if (file) {
                this.readZipFile(file);
            }
        }
        handlePostFileInput(event) {
            const file = event.target.files[0];
            if (file) {
                this.readPostZipFile(file);
            }
        }
        readZipFile(file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.packageData.data.Content = reader.result;
            };
            reader.readAsDataURL(file);
        }
        readPostZipFile(file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.postPackageData.Content = reader.result;
            };
            reader.readAsDataURL(file);
        }
        getPackage() {
            this.apiService.packageRetrieve({ id: this.packageId, 'X-Authorization': this.authHeader }).subscribe(response => {
                this.getPackageData = response;
                console.log('Package retrieval successful', response);
            }, error => {
                this.getPackageData = {
                    data: {
                        Content: '',
                        URL: '',
                        JSProgram: ''
                    },
                    metadata: {
                        Name: '',
                        Version: '',
                        ID: ''
                    }
                };
                console.log('Error retrieving package:', error);
            });
        }
        updatePackage() {
            this.updateMessage = '';
            this.apiService.packageUpdate({ id: this.packageData.metadata.ID, 'X-Authorization': this.authHeader, body: this.packageData }).subscribe(response => {
                this.updateMessage = 'Package update successful';
                console.log('Package update successful:', response);
            }, error => {
                this.updateMessage = 'Error updating package';
                console.log('Error updating package:', error);
            });
        }
        deletePackage() {
            this.deleteMessage = '';
            this.apiService.packageDelete({ id: this.deletePackageId, 'X-Authorization': this.authHeader }).subscribe(response => {
                this.deleteMessage = 'Package deletion successful';
                console.log('Package deletion successful:', response);
            }, error => {
                this.deleteMessage = 'Error deleting package';
                console.log('Error deleting package:', error);
            });
        }
        putPackage() {
            this.apiService.packageCreate({ 'X-Authorization': this.authHeader, body: this.postPackageData }).subscribe(response => {
                this.postPackageDataResponse = response;
                console.log('Package post successful:', response);
            }, error => {
                console.log('Package post unsuccessful:', error);
            });
        }
        ratePackage() {
            this.apiService.packageRate({ 'X-Authorization': this.authHeader, id: this.ratePackageId }).subscribe(response => {
                this.ratePackageResponse = response;
                console.log('Package rating successful', response);
            }, error => {
                this.ratePackageResponse = {
                    BusFactor: 0,
                    Correctness: 0,
                    GoodPinningPractice: 0,
                    LicenseScore: 0,
                    NetScore: 0,
                    PullRequest: 0,
                    RampUp: 0,
                    ResponsiveMaintainer: 0
                };
                console.log('Error rating package:', error);
            });
        }
        downloadZip() {
            const content = this.getPackageData.data.Content;
            // Check if content is defined before proceeding
            if (!content) {
                console.error('Content is undefined. Cannot download ZIP.');
                return;
            }
            const fileName = `${this.getPackageData.metadata.Name}-${this.getPackageData.metadata.Version}.zip`;
            // Convert base64 content to a Blob
            const byteCharacters = atob(content);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            const blob = new Blob(byteArrays, { type: 'application/zip' });
            // Create a download link and trigger the download
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    __setFunctionName(_classThis, "PackageComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PackageComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PackageComponent = _classThis;
})();
exports.PackageComponent = PackageComponent;
