import 'kequtest';
import assert from 'assert';
import createBranch from '../../../src/router/modules/create-branch';
import createRoute from '../../../src/router/modules/create-route';
import createRenderer from '../../../src/router/modules/create-renderer';
import createErrorHandler from '../../../src/router/modules/create-error-handler';

it('creates a branch', () => {
    const addable = createBranch();

    assert.deepStrictEqual(addable(), {
        routes: [],
        renderers: [],
        errorHandlers: []
    });
});

it('ignores wild pathnames', () => {
    const handle = () => {};
    const addable = createBranch('/hello/there/**').add(
        createRoute('POST', handle)
    );

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: ['hello', 'there'],
            handles: [handle],
            method: 'POST'
        }],
        renderers: [],
        errorHandlers: []
    });
});

it('augments routes', () => {
    const handles = [() => {}, () => {}, () => {}, () => {}];
    const addable = createBranch('/hello/there', handles[0], handles[1]).add(
        createRoute('POST', '/cat/car', handles[2], handles[3])
    );

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: ['hello', 'there', 'cat', 'car'],
            handles,
            method: 'POST'
        }],
        renderers: [],
        errorHandlers: []
    });
});

it('augments renderers', () => {
    const handles = [() => {}, () => {}, () => {}];
    const addable = createBranch('/hello/there', handles[0], handles[1]).add(
        createRenderer('text/html', '/cat/car', handles[2])
    );

    assert.deepStrictEqual(addable(), {
        routes: [],
        renderers: [{
            parts: ['hello', 'there', 'cat', 'car'],
            handle: handles[2],
            contentType: 'text/html'
        }],
        errorHandlers: []
    });
});

it('augments error handlers', () => {
    const handles = [() => {}, () => {}, () => {}];
    const addable = createBranch('/hello/there', handles[0], handles[1]).add(
        createErrorHandler('text/html', '/cat/car', handles[2])
    );

    assert.deepStrictEqual(addable(), {
        routes: [],
        renderers: [],
        errorHandlers: [{
            parts: ['hello', 'there', 'cat', 'car'],
            handle: handles[2],
            contentType: 'text/html'
        }]
    });
});

it('augments branches', () => {
    const handles = [() => {}, () => {}, () => {}, () => {}];
    const routeHandles = [() => {}, () => {}, () => {}, () => {}];
    const rendererHandles = [() => {}, () => {}];
    const errorHandlerHandles = [() => {}, () => {}];
    const addable = createBranch('/hello/there', handles[0], handles[1]).add(
        createBranch('/cat/car', handles[2], handles[3]).add(
            createRoute('POST1', '/super/man1', routeHandles[0], routeHandles[1]),
            createRenderer('text/html2', '/super/man2', rendererHandles[0]),
            createErrorHandler('text/html3', '/super/man3', errorHandlerHandles[0])
        ),
        createRoute('POST4', '/super/man4', routeHandles[2], routeHandles[3]),
        createRenderer('text/html5', '/super/man5', rendererHandles[1]),
        createErrorHandler('text/html6', '/super/man6', errorHandlerHandles[1])
    );

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: ['hello', 'there', 'cat', 'car', 'super', 'man1'],
            handles: [...handles, routeHandles[0], routeHandles[1]],
            method: 'POST1'
        }, {
            parts: ['hello', 'there', 'super', 'man4'],
            handles: [handles[0], handles[1], routeHandles[2], routeHandles[3]],
            method: 'POST4'
        }],
        renderers: [{
            parts: ['hello', 'there', 'cat', 'car', 'super', 'man2'],
            handle: rendererHandles[0],
            contentType: 'text/html2'
        }, {
            parts: ['hello', 'there', 'super', 'man5'],
            handle: rendererHandles[1],
            contentType: 'text/html5'
        }],
        errorHandlers: [{
            parts: ['hello', 'there', 'cat', 'car', 'super', 'man3'],
            handle: errorHandlerHandles[0],
            contentType: 'text/html3'
        }, {
            parts: ['hello', 'there', 'super', 'man6'],
            handle: errorHandlerHandles[1],
            contentType: 'text/html6'
        }]
    });
});
