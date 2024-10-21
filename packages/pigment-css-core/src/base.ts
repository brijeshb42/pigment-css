import type * as CSS from 'csstype';
import { Theme } from '@pigment-css/theme';

export type CSSProperties = CSS.PropertiesFallback<number | string>;

export type CSSPropertiesMultiValue = {
  [K in keyof CSSProperties]: CSSProperties[K] | Array<Extract<CSSProperties[K], string>>;
};

export type CSSPseudosNoCallback = { [K in CSS.Pseudos]?: CSSObjectNoCallback };

export interface CSSOthersObjectNoCallback {
  [selector: string]: CSSObjectNoCallback;
}

export type CSSObjectNoCallback =
  | CSSPropertiesMultiValue
  | CSSPseudosNoCallback
  | CSSOthersObjectNoCallback;

export type ThemeArgs = {
  theme: Theme;
};
export type Primitve = string | null | undefined | boolean | number;
