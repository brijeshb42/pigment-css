import { StrictOptions } from '@wyw-in-js/shared';

export type GenerateClassData<M, E> = {
  /**
   * Original classname that would be used.
   */
  slug: string;
  /**
   * The metadata argument that you passed to the function call, usually as the 2nd argument.
   *
   * ```js
   * const className = css(cssObject, metadata);
   */
  metadata: M;
  /**
   * The variable name that the function call's return value is assigned to.
   */
  displayName: string;
  /**
   * The name of the function that is being called, ie, `css`, `styled`, etc
   */
  functionName: string;
  /**
   * All the extra data specific to the above `functionName` call.
   */
  extraData: E;
};

/**
 * The
 */
export type PigmentConfig = Pick<StrictOptions, 'classNameSlug'> & {
  generateClassName<M, E>(data: GenerateClassData<M, E>): string;
};
