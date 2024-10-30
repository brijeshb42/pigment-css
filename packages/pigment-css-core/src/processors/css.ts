import { BaseProcessor } from '@pigment-css/shared';

/**
 * @description Scope css class generation similar to css from emotion.
 *
 * @example
 * ```ts
 * import { css } from '@pigment-css/react';
 *
 * const class1 = css(({theme}) => ({
 *  color: (theme.vars || theme).palette.primary.main,
 * }))
 * ```
 *
 * <html className={class1} />
 */
export default class CssProcessor extends BaseProcessor {
  getBaseClass(): string | undefined {
    throw new Error('Method not implemented.');
  }
  get value() {
    throw new Error('Method not implemented.');
  }
  doEvaltimeReplacement(): void {
    throw new Error('Method not implemented.');
  }
  doRuntimeReplacement(): void {
    throw new Error('Method not implemented.');
  }
}
