import * as React from 'react';
import type * as CSS from 'csstype';
import { css as emotionCss, cache } from './emotion';

export type CSSProperties = CSS.PropertiesFallback<number | string> & {
  [index: `--${string}`]: string;
  [index: `$${string}`]: string;
};

type CSSPropertiesBase = {
  [K in keyof CSSProperties]: CSSProperties[K];
};

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

export type CSSPropertiesMultiValueWithProps<Props extends object> = {
  [K in keyof CSSPropertiesMultiValue]:
    | CSSPropertiesMultiValue[K]
    | ((props: Props) => CSSPropertiesBase[K]);
};

export type CSSPseudos<Props extends object> = { [K in CSS.Pseudos]?: CSSObject<Props> };

export interface CSSOthersObject<Props extends object> {
  [selector: string]: CSSObject<Props>;
}

export type CSSObject<Props extends object> =
  | CSSPropertiesMultiValueWithProps<Props>
  | CSSPseudos<Props>
  | CSSOthersObject<Props>;

export type Primitive = string | null | undefined | boolean | number;

export function css(style: CSSObjectNoCallback & { className?: string }) {
  const className = style.className;
  delete style.className;
  const emotionCls = className
    ? emotionCss({
        [`.${className}`]: style,
      })
    : emotionCss(style);
  let cssStr = cache.inserted[emotionCls.slice(3)];
  if (className && typeof cssStr === 'string') {
    cssStr = cssStr.replaceAll(`.${emotionCls}`, '');
  }
  const result: { className: string; __selector?: string } = {
    className: className || emotionCls,
  };
  Object.defineProperties(result, {
    __css: { configurable: false, writable: false, value: cssStr },
    __selector: {
      configurable: false,
      writable: false,
      value: `.${result.className}`,
    },
  });
  result.toString = function toString() {
    // eslint-disable-next-line no-underscore-dangle
    return this.__selector as string;
  };
  return result;
}

export function styled<Tag extends keyof React.JSX.IntrinsicElements>(
  tag: Tag,
  style: CSSObjectNoCallback & { className?: string },
) {
  const className = style.className;
  delete style.className;
  const emotionCls = className
    ? emotionCss({
        [`.${className}`]: style,
      })
    : emotionCss(style);
  let cssStr = cache.inserted[emotionCls.slice(3)];
  if (className && typeof cssStr === 'string') {
    cssStr = cssStr.replaceAll(`.${emotionCls}`, '');
  }
  const result: { className: string; __selector?: string } = {
    className: className || emotionCls,
  };
  Object.defineProperties(result, {
    __css: { configurable: false, writable: false, value: cssStr },
    __selector: {
      configurable: false,
      writable: false,
      value: `.${result.className}`,
    },
    __target: {
      configurable: false,
      writable: false,
      value: {
        name: 'styled',
        path: '@pigment-css/v8-styled-engine/runtime',
        args: typeof tag === 'string' ? [tag] : [],
      },
    },
  });
  result.toString = function toString() {
    // eslint-disable-next-line no-underscore-dangle
    return this.__selector as string;
  };
  return result;
}
