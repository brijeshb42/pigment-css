import { CSSObjectNoCallback, Primitve, ThemeArgs } from './base';

type CssArg =
  | ((themeArgs: ThemeArgs) => CSSObjectNoCallback | string)
  | CSSObjectNoCallback
  | string;
type CssFn = (themeArgs: ThemeArgs) => string | number;

interface BaseInterface {
  className: string;
}
export interface Css {
  /**
   * @returns {string} The generated css class name to be referenced.
   */
  (arg: TemplateStringsArray, ...templateArgs: (Primitve | CssFn)[]): string;
  <M extends BaseInterface>(
    metadata: M,
  ): (arg: TemplateStringsArray, ...templateArgs: (Primitve | CssFn)[]) => string;

  /**
   * @returns {string} The generated css class name to be referenced.
   */
  (...args: CssArg[]): string;
  <M extends BaseInterface>(metadata: M, args: CssArg | CssArg[]): string;
}

declare const css: Css;

export default css;
