/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/jsx-filename-extension */
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';

import { gridAtomics } from './baseAtomics';
import styled from './styled';

const GridComponent = styled('div')({
  width: 'var(--Column-width)',
  maxWidth: 'var(--Column-max-width)',
  flex: 'var(--Column-flex)',
  marginLeft: 'var(--Item-margin-left)',
  variants: [
    {
      props: { container: true },
      style: {
        display: 'flex',
        gap: 'var(--Row-gap) var(--Column-gap)',
      }
    },
  ]
})

const Grid = React.forwardRef(function Grid(
  {
    children,
    spacing = 0,
    columnSpacing,
    rowSpacing,
    style,
    className,
    component = 'div',
    direction = 'row',
    flexWrap = 'wrap',
    columns = 12,
    container = false,
    size,
    offset,
    alignItems,
    justifyContent,
    ...rest
  },
  ref,
) {
  const GridAtomicsObj = {
    direction,
    flexWrap,
  };
  if (alignItems) {
    GridAtomicsObj.alignItems = alignItems;
  }
  if (justifyContent) {
    GridAtomicsObj.justifyContent = justifyContent;
  }
  if (container) {
    GridAtomicsObj['--Column-count'] = columns;
    GridAtomicsObj['--Column-gap'] = spacing;
    GridAtomicsObj['--Row-gap'] = spacing;

    if (columnSpacing) {
      GridAtomicsObj['--Column-gap'] = columnSpacing;
    }

    if (rowSpacing) {
      GridAtomicsObj['--Row-gap'] = rowSpacing;
    }
  }
  if (size) {
    GridAtomicsObj['--Column-span'] = size;
    GridAtomicsObj['--Column-width'] = size;
    GridAtomicsObj['--Column-max-width'] = size;
    GridAtomicsObj['--Column-flex'] = size;
    
  }
  if (offset) {
    GridAtomicsObj['--Item-offset'] = offset;
    GridAtomicsObj['--Item-margin-left'] = offset;
  }

  const ownerState = { container };

  const GridClasses = gridAtomics(GridAtomicsObj);
  return (
    <GridComponent
      as={component}
      ref={ref}
      className={clsx(GridClasses.className, className)}
      style={{ ...style, ...GridClasses.style }}
      {...rest}
      ownerState={ownerState}
    >
      {children}
    </GridComponent>
  );
});

process.env.NODE_ENV !== 'production'
  ? (Grid.propTypes /* remove-proptypes */ = {
      // ┌────────────────────────────── Warning ──────────────────────────────┐
      // │ These PropTypes are generated from the TypeScript type definitions. │
      // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
      // └─────────────────────────────────────────────────────────────────────┘
      /**
       * @ignore
       */
      alignItems: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
        PropTypes.oneOf([
          'center',
          'end',
          'flex-end',
          'flex-start',
          'self-end',
          'self-start',
          'start',
          'baseline',
          'normal',
          'stretch',
        ]),
        PropTypes.arrayOf(
          PropTypes.oneOf([
            'center',
            'end',
            'flex-end',
            'flex-start',
            'self-end',
            'self-start',
            'start',
            'baseline',
            'normal',
            'stretch',
          ]),
        ),
        PropTypes.object,
      ]),
      /**
       * The content of the component.
       */
      children: PropTypes.node,
      /**
       * @ignore
       */
      className: PropTypes.string,
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      component: PropTypes.elementType,
      /**
       * @ignore
       */
      direction: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
        PropTypes.oneOf(['column', 'column-reverse', 'row', 'row-reverse']),
        PropTypes.arrayOf(PropTypes.oneOf(['column', 'column-reverse', 'row', 'row-reverse'])),
        PropTypes.object,
      ]),
      /**
       * @ignore
       */
      display: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
        PropTypes.oneOf(['flex', 'inline-flex']),
        PropTypes.arrayOf(PropTypes.oneOf(['flex', 'inline-flex']).isRequired),
        PropTypes.object,
      ]),
      /**
       * @ignore
       */
      divider: PropTypes.node,
      /**
       * @ignore
       */
      justifyContent: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
        PropTypes.oneOf([
          'end',
          'start',
          'flex-end',
          'flex-start',
          'center',
          'space-between',
          'space-around',
          'space-evenly',
        ]),
        PropTypes.arrayOf(
          PropTypes.oneOf([
            'end',
            'start',
            'flex-end',
            'flex-start',
            'center',
            'space-between',
            'space-around',
            'space-evenly',
          ]),
        ),
        PropTypes.object,
      ]),
      /**
       * @ignore
       */
      spacing: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired),
        PropTypes.number,
        PropTypes.object,
        PropTypes.string,
      ]),
    })
  : void 0;

Grid.displayName = 'Grid';

export default Grid;
