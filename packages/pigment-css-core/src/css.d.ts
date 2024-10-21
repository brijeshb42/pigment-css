import { CSSObjectNoCallback, Primitve, ThemeArgs } from './base';

type CssArg = ((themeArgs: ThemeArgs) => CSSObjectNoCallback) | CSSObjectNoCallback;
type CssFn = (themeArgs: ThemeArgs) => string | number;

export interface Css {
  /**
   * @returns {string} The generated css class name to be referenced.
   */
  (arg: TemplateStringsArray, ...templateArgs: (Primitve | CssFn)[]): string;
  /**
   * @returns {string} The generated css class name to be referenced.
   */
  (...arg: CssArg[]): string;
}

declare const css: Css;

export default css;
