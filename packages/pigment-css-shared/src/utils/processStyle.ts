import unitlessKeys from '@emotion/unitless';
import cssesc from 'cssesc';

function isUnitLess(cssKey: string) {
  return unitlessKeys[cssKey] === 1;
}

export type ProcessOptions = {
  getVariableName: () => string;
};

export type ProcessStyleReturn<T> = {
  result: T;
  variables: Record<string, [Function, 1 | 0]>;
};

function splitAndJoin(str: string): string {
  return str.split('.').join('-');
}

function getCSSVar(key: string, wrapInVar = false): string {
  let result: string;
  if (key.startsWith('$$')) {
    result = `---${cssesc(splitAndJoin(key.substring(2)))}`;
  } else if (key.startsWith('$')) {
    result = `--${cssesc(splitAndJoin(key.substring(1)))}`;
  } else {
    result = `--${cssesc(splitAndJoin(key))}`;
  }
  if (wrapInVar) {
    return `var(${result})`;
  }
  return result;
}

function transformProbableCssVar(value: string): string {
  const variableRegex = /(\$\$?\w[\d+\w+.]{0,})/g;
  return value.replaceAll(variableRegex, (sub) => {
    return getCSSVar(sub, true);
  });
}

export function processStyle<T extends object>(
  t: T,
  options: ProcessOptions,
): ProcessStyleReturn<T> {
  const result: Record<string, string | number | object> = {};
  let variables: ProcessStyleReturn<T>['variables'] = {};

  Object.entries(t).forEach(([key, value]) => {
    let newKey = key;
    if (key.startsWith('$')) {
      newKey = getCSSVar(key);
    }
    if (typeof value === 'string') {
      result[newKey] = transformProbableCssVar(value);
    } else if (typeof value === 'number' || value === null) {
      result[newKey] = value;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        result[newKey] = value;
      } else {
        const nestedResult = processStyle(value, options);
        result[newKey] = nestedResult.result;
        variables = {
          ...nestedResult.variables,
          ...variables,
        };
      }
    } else if (typeof value === 'function') {
      const variableRaw = getCSSVar(cssesc(options.getVariableName()));
      variables[variableRaw] = [value, isUnitLess(newKey) ? 1 : 0];
      result[newKey] = getCSSVar(variableRaw, true);
    }
  });
  return {
    result: result as T,
    variables,
  };
}

export { serializeStyles } from '@emotion/serialize';
