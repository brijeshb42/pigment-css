import type { CSSProperties, Primitive, ThemeArgs } from './base';
import { BaseInterface } from './css';

interface KeyframesObject {
  [key: string]: {
    [K in keyof CSSProperties]: CSSProperties[K] | Array<CSSProperties[K]>;
  };
}

type KeyframesFn = (themeArgs: ThemeArgs) => string;
type KeyframesArg = KeyframesObject | string | ((themeArgs: ThemeArgs) => KeyframesObject | string);

interface KeyframesNoOption {
  (arg: TemplateStringsArray, ...templateArgs: (Primitive | KeyframesFn)[]): string;
  (arg: KeyframesArg): string;
}

interface KeyframesWithOption {
  <M extends BaseInterface>(metadata: M): KeyframesNoOption;
}

declare const keyframes: KeyframesNoOption & KeyframesWithOption;

export default keyframes;
