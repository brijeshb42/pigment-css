import { expect } from 'chai';
import { processStyle } from '../../src/utils';

describe('processStyle', () => {
  it('should transform css variables', () => {
    let count = 0;
    function getVariableName() {
      count += 1;
      return `var-${count}`;
    }
    const style = {
      $$hello: 'world',
      $hello1: 'world',
      '.cls1': {
        border: '1px solid $palette.primary.main $$hello',
        color: () => 'red',
        flexGrow: () => '1',
      },
    };
    const res = processStyle(style, {
      getVariableName,
    });
    expect(res).to.deep.equal({
      result: {
        '---hello': 'world',
        '--hello1': 'world',
        '.cls1': {
          border: '1px solid var(--palette-primary-main) var(---hello)',
          color: 'var(--var-1)',
          flexGrow: 'var(--var-2)',
        },
      },
      variables: {
        '--var-1': [style[`.cls1`].color, 0],
        '--var-2': [style[`.cls1`].flexGrow, 1],
      },
    });
  });
});
