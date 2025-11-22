/**
 * Public entry point for the kequapp library.
 *
 * This file is the authoritative barrel for consumers of the library. It
 * re-exports the top-level functions, helpers, built-in renderers and the
 * canonical public types. Keep this list intentionally small and stable —
 * prefer adding new exports here only when they are intended to be part of
 * the public API.
 */

/* Application entry */
export { createApp } from './router/create-app.ts';

/* Built-in helpers */
export { sendFile } from './built-in/helpers/send-file.ts';
export { staticDirectory } from './built-in/helpers/static-directory.ts';

/* Built-in renderers */
export { jsonRenderer } from './built-in/json-renderer.ts';
export { textRenderer } from './built-in/text-renderer.ts';

/* Built-in tools */
export { Ex, unknownToEx } from './built-in/tools/ex.ts';
export { inject } from './built-in/tools/inject.ts';

/* Router factories */
export * from './router/modules.ts';

/* Test fakes */
export { FakeReq, FakeRes } from './util/fake-http.ts';

export * from './types.ts';
