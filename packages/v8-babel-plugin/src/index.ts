import type { ConfigAPI, PluginObj } from '@babel/core';
import * as core from '@babel/core';

import { transform, Features, UnknownAtRule, MediaRule, ReturnedRule } from 'lightningcss';

type Core = typeof core;

type Babel = Core & ConfigAPI;

// function calculateHash(str: string) {
//   let hash = 5381;
//   for (let i = 0; i < str.length; i += 1) {
//     // eslint-disable-next-line no-bitwise
//     hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
//   }
//   return hash;
// }

type TransformOptions = {
  filename: string;
  projectRoot: string;
  className?: string;
};

const mediaQueries = {
  sm: '@media (width >= 40rem)',
  md: '@media (width >= 48rem)',
  lg: '@media (width >= 64rem)',
  xl: '@media (width >= 80rem)',
  '2xl': '@media (width >= 96rem)',
};

// const CUSTOM_MEDIA_CSS = Object.keys(mediaQueries).reduce((acc, key))

function generateCss(cssStr: string, options: TransformOptions) {
  const { className, ...rest } = options;
  try {
    const hasScopePseudo =
      cssStr.slice(0, 6) === ':scope' || cssStr.split('\n')[1]?.trim().slice(0, 6) === ':scope';
    let finalCss = hasScopePseudo ? cssStr : `.${options.className ?? 'current'}{${cssStr}}`;
    finalCss = `@custom-media --md (width >= 40rem);\n${finalCss}`;
    const res = transform({
      code: Buffer.from(finalCss),
      minify: true,
      sourceMap: true,
      cssModules: false /* {
        pattern: '[name]_[local]_[content-hash]',
      }, */,
      include: Features.Nesting,
      visitor: {},
      drafts: {
        customMedia: true,
      },
      ...rest,
    });
    return {
      css: Buffer.from(res.code).toString(),
      map: res.map ? Buffer.from(res.map).toString() : null,
      exports: res.exports,
    };
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

function isValidTag(tag: core.NodePath<core.types.Expression>) {
  if (tag.isMemberExpression()) {
    if (tag.get('object').isIdentifier({ name: 'styled' }) && tag.get('property').isIdentifier()) {
      return {
        name: 'styled',
        arg: (tag.get('property').node as core.types.Identifier).name,
      };
    }
    return false;
  }
  if (tag.isCallExpression()) {
    if (tag.get('callee').isIdentifier({ name: 'styled' })) {
      return {
        name: 'styled',
        arg: '__original',
      };
    }
    return false;
  }
  if (tag.isIdentifier({ name: 'css' })) {
    return {
      name: 'css',
      arg: '',
    };
  }
  return false;
}

function styledBabelPlugin(babel: Babel): PluginObj {
  babel.assertVersion('^7 || ^8');
  const { types: t } = babel;

  const classNameMap = new Map<string, Map<string, string>>();

  return {
    name: 'babel-plugin-v8-styled-engine',
    visitor: {
      Program: {
        enter(_node, opts) {
          classNameMap.set(opts.filename as string, new Map<string, string>());
        },
      },
      TaggedTemplateExpression(node, opts) {
        const quasi = node.get('quasi');
        const tag = node.get('tag');
        const validTagRes = isValidTag(tag);
        if (!validTagRes) {
          return;
        }
        const varName = node.findParent((p) => p.isVariableDeclarator());
        const expressions = quasi.get('expressions');
        const quasis = quasi.get('quasis');
        const rawStr = quasis.reduce((acc, item, index) => {
          const expr = expressions[index - 1];
          if (!expr) {
            return acc + item.node.value.cooked;
          }
          if (expr.isIdentifier()) {
            const maybeClassName = classNameMap.get(opts.filename as string)?.get(expr.node.name);
            if (!maybeClassName) {
              throw expr.buildCodeFrameError(
                `${expr.node.name} is interpolated in the css but it is not a valid css selector.`,
              );
            }
            const selector =
              quasis[index - 1].node.value.cooked?.slice(-1) === '.'
                ? maybeClassName
                : `:global(.${maybeClassName})`;
            return `${acc}${selector}${item.node.value.cooked}`;
          }
          return acc;
        }, '');
        const { css, exports: classExports } = generateCss(rawStr, {
          filename: opts.filename as string,
          projectRoot: opts.cwd,
        });

        if (varName && varName.isVariableDeclarator() && classExports) {
          const id = varName.get('id');
          if (id.isIdentifier()) {
            classNameMap.get(opts.filename as string)?.set(id.node.name, classExports.current.name);
          }
        }

        const cssProperty = t.objectProperty(t.identifier('__css'), t.stringLiteral(css));
        const exportedProps = classExports
          ? Object.entries(classExports).reduce(
              (acc, [key, val]) => {
                acc.push(t.objectProperty(t.stringLiteral(key), t.stringLiteral(val.name)));
                return acc;
              },
              [] as unknown as ReturnType<typeof t.objectProperty>[],
            )
          : [];
        const obj = t.objectExpression([
          cssProperty,
          t.objectProperty(t.identifier('classes'), t.objectExpression(exportedProps)),
        ]);
        if (validTagRes.arg.length === 0) {
          node.replaceWith(obj);
        } else {
          const args =
            validTagRes.arg === '__original'
              ? (tag as unknown as core.NodePath<core.types.CallExpression>)
                  .get('arguments')
                  .map((i) => i.node)
              : [t.stringLiteral(validTagRes.arg)];
          const parentCall = t.callExpression(t.identifier(validTagRes.name), args as any);
          node.replaceWith(t.callExpression(parentCall, [obj]));
        }
      },
    },
  };
}

export default styledBabelPlugin;
