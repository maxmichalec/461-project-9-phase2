"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_out_content_pipe_1 = require("./filter-out-content.pipe");
describe('FilterOutContentPipe', () => {
    it('create an instance', () => {
        const pipe = new filter_out_content_pipe_1.FilterOutContentFieldPipe();
        expect(pipe).toBeTruthy();
    });
});
