/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Logo from './logo';
import UIContext from './ui-context';
import { Draggable, DragComponent } from 'react-dragtastic';
import './card.css';

export function GetDraggable(props, classNames, cardStyle, onClick) {
  /* eslint-disable-next-line react/display-name */
  return ({ isActive, events }) => {
    return (
      <div
        className={classNames.join(' ')}
        style={{
          ...props.style,
          ...cardStyle,
          opacity: isActive ? 0 : 1,
          pointerEvents: isActive ? 'none' : 'all',
        }}
        onClick={onClick}
        {...events}
      >
        {props.isFaceUp ? props.front : props.back}
      </div>
    );
  };
}

export function GetDragComponent(
  props,
  classNames,
  ref,
  isOverAcceptedCallback
) {
  /* eslint-disable-next-line react/display-name, react/prop-types */
  return ({ x, y, isOverAccepted, currentlyHoveredDroppableId }) => {
    const classes = [...classNames];
    /* eslint-disable-next-line react/prop-types */
    let content = props.back;

    isOverAcceptedCallback(isOverAccepted);

    /* eslint-disable-next-line react/prop-types */
    if (props.isFaceUp) {
      /* eslint-disable-next-line react/prop-types */
      content = props.front;
    }

    if (currentlyHoveredDroppableId !== null) {
      if (isOverAccepted) {
        classes.push('accept');
      } else {
        classes.push('reject');
      }
    }

    return (
      <div
        className={classes.join(' ')}
        ref={ref}
        style={{
          cursor: 'pointer',
          borderWidth: 2,
          pointerEvents: 'none',
          position: 'fixed',
          zIndex: 2000000000,
          boxShadow: '5px 5px 5px #eee',
          left: x - 50,
          top: y - 70,
        }}
      >
        {content}
      </div>
    );
  };
}
/* eslint-enable */

export class CardImpl extends React.Component {
  static propTypes = {
    isFaceUp: PropTypes.bool,
    front: PropTypes.node,
    back: PropTypes.node,
    className: PropTypes.string,
    dragZone: PropTypes.string,
    style: PropTypes.any,
    onClick: PropTypes.func,
    context: PropTypes.any.isRequired,
    inDeck: PropTypes.bool,
    data: PropTypes.any,
    deckPosition: PropTypes.number,
  };

  static defaultProps = {
    onClick: () => {},
    isFaceUp: false,
    dragZone: 'bgio-card',
    front: <div className="bgio-card__front">Card</div>,
    back: (
      <div className="bgio-card__back">
        <Logo width="48" />
      </div>
    ),
  };

  constructor(props) {
    super(props);
    this.id = props.context.genID();
    this.dragComponentRef = React.createRef();
    this.isOverAccepted = false;
  }

  onClick = () => {
    this.props.onClick(this.props.data);
  };

  render() {
    const classNames = ['bgio-card'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }

    let cardStyle = {};

    if (this.props.inDeck) {
      cardStyle = {
        position: 'absolute',
        zIndex: this.props.deckPosition,
      };
    }

    return (
      <div>
        <Draggable
          id={this.id}
          type={this.props.dragZone}
          data={this.props.data}
        >
          {GetDraggable(this.props, classNames, cardStyle, this.onClick)}
        </Draggable>

        <DragComponent for={this.id}>
          {GetDragComponent(
            this.props,
            classNames,
            this.dragComponentRef,
            o => (this.isOverAccepted = o)
          )}
        </DragComponent>
      </div>
    );
  }
}

const Card = props => (
  <UIContext.Consumer>
    {context => <CardImpl {...props} context={context} />}
  </UIContext.Consumer>
);

export { Card };
