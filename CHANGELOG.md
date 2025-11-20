# Changelog

Pre‑1.0: minor versions may include breaking changes.

## 0.12.0 - 2025-11-20

**Added:** `getBody` now accepts a `trim` attribute. When `true`, leading and trailing whitespace is removed from all string body values. In addition to trimming strings, it also removes empty strings. Thus `required` fields are not allowed to be empty strings, `array` fields will not contain empty strings, and so on.

## 0.11.0 - 2025-11-09

**Added:** `cookies` helper now supports the `domain` attribute.

**Changed:** Applying the `logger` parameter in your tree only affects which logger kequapp uses internally. It no longer injects the logger into your code. Methods for `error` `warn` and `info` are the only methods used by kequapp.

**Removed:** `logger` parameter removed from bundle. Use `import { logger } from '<your logger>'` to get a logger instance in any file.

## 0.10.0 - 2025-10-05

**Breaking:** `Ex.<ErrorName>()` methods no longer accept 3+ parameters. Second parameter is `options` and it is a `Record<string, unknown>`.

**Changed:** Magic keyword `cause` added to `Ex` options. It is removed from the private developer attribute `error.info`, and sent to the client as `error.cause` when used. Attribute `error.info` still contains the remaining options passsed.

## 0.9.0 – 2025-07-18

**Breaking:** ESM‑only distribution (no CommonJS). Use `import { createApp } from 'kequapp'` or `await import()` from CJS.

**Changed:** Package `exports` now only expose ESM entry. Tests updated to use native node test runner and libraries.

**Removed:** `require()` support.

## 0.8.0 – 2024-06-07

**Breaking:** `handle(s)` renamed to `action(s)`; `createHandle` → `createAction`.

**Changed:** Docs and examples updated to reflect terminology.
