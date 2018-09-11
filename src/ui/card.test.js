/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { UI } from './ui';
import { Card, CardImpl, GetDraggable, GetDragComponent } from './card';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const context = { genID: () => 0 };

describe('Card', () => {
  test('is rendered', () => {
    const card = Enzyme.shallow(
      <UI>
        <Card />
      </UI>
    );
    expect(card.html()).toContain('<div class="bgio-card');
  });

  test('className', () => {
    const card = Enzyme.shallow(
      <UI>
        <Card className="custom" />
      </UI>
    );
    expect(card.html()).toContain('custom');
  });

  describe('onClick', () => {
    test('default', () => {
      const root = Enzyme.mount(<CardImpl context={context} data={{}} />);
      root.instance().onClick();
    });

    test('passed in', () => {
      const onClick = jest.fn();
      const root = Enzyme.mount(
        <CardImpl context={context} onClick={onClick} data={{}} />
      );
      root.instance().onClick();
      expect(onClick).toHaveBeenCalled();
    });
  });
});

describe('GetDraggable', () => {
  test('is rendered', () => {
    const Draggable = GetDraggable({}, [], {});
    const root = Enzyme.mount(<Draggable />);
    expect(root.html()).toContain('div');
  });

  test('is rendered - isActive', () => {
    const Draggable = GetDraggable({}, [], {});
    const root = Enzyme.mount(<Draggable isActive={true} />);
    expect(root.html()).toContain('div');
  });

  test('isFaceUp', () => {
    const Draggable = GetDraggable(
      { isFaceUp: true, front: 'front-content' },
      [],
      {}
    );
    const root = Enzyme.mount(<Draggable />);
    expect(root.html()).toContain('front-content');
  });
});

describe('GetDragComponent', () => {
  let callback = jest.fn();

  test('is rendered', () => {
    const DragComponent = GetDragComponent({}, [], React.createRef(), callback);
    const root = Enzyme.mount(<DragComponent x={0} y={0} />);
    expect(root.html()).toContain('div');
  });

  test('isOverAccepted callback', () => {
    const DragComponent = GetDragComponent({}, [], React.createRef(), callback);
    const root = Enzyme.mount(
      <DragComponent
        x={0}
        y={0}
        isOverAccepted={true}
        currentlyHoveredDroppableId="id"
      />
    );
    expect(root.html()).toContain('accept');
    expect(callback).toBeCalledWith(true);
  });

  test('isFaceUp', () => {
    const DragComponent = GetDragComponent(
      { isFaceUp: true, front: 'front-content' },
      [],
      React.createRef(),
      callback
    );
    const root = Enzyme.mount(
      <DragComponent
        x={0}
        y={0}
        isOverAccepted={true}
        currentlyHoveredDroppableId="id"
      />
    );
    expect(root.html()).toContain('front-content');
  });
});

describe('DragComponent', () => {
  test('isOverAccepted callback', () => {
    const root = Enzyme.mount(<CardImpl context={context} />);
    const t = root.find('DragComponent');
    t.instance().props.children({
      x: 0,
      y: 0,
      isOverAccepted: true,
      currentlyHoveredDroppableId: null,
    });
  });
});
