import { BaseProcessor as WywBaseProcessor } from '@wyw-in-js/processor-utils';

export default abstract class BaseProcessor extends WywBaseProcessor {
  abstract getBaseClass(): string | undefined;

  get asSelector(): string {
    const baseClass = this.getBaseClass();
    return `.${baseClass ?? this.className}`;
  }
}
