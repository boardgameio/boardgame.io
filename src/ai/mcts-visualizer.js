import React from 'react';
import PropTypes from 'prop-types';
import './mcts-visualizer.css';

// eslint-disable-next-line react/display-name
export const MCTSVisualizer = renderState => metadata => (
  <MCTSRoot root={metadata} renderState={renderState} />
);

export class MCTSRoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = { root: props.root };
  }

  static propTypes = {
    root: PropTypes.any.isRequired,
    renderState: PropTypes.func,
    style: PropTypes.any,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ root: nextProps.root });
  }

  render() {
    const root = this.state.root;

    const children = root.children.map((child, i) => {
      return (
        <MCTSNode
          key={i}
          onClick={() => this.setState({ root: child })}
          renderState={this.props.renderState}
          {...child}
          parentVisits={root.visits}
        />
      );
    });

    const parent = root.parent && (
      <MCTSNode
        isParent={true}
        onClick={() => this.setState({ root: root.parent })}
        renderState={this.props.renderState}
        {...root.parent}
      />
    );

    return (
      <div className="mcts-tree" style={this.props.style}>
        {parent}
        <MCTSNode
          {...root}
          isRoot={true}
          renderState={this.props.renderState}
        />
        <div className="children">{children}</div>
      </div>
    );
  }
}

export const MCTSNode = ({
  state,
  value,
  visits,
  parentVisits,
  renderState,
  onClick,
  isParent,
  isRoot,
}) => {
  let classes = 'mcts-node';
  if (isRoot) {
    classes += ' mcts-root';
  }
  if (isParent) {
    classes += ' mcts-parent';
  }

  let uct = value / visits + Math.sqrt(2 * Math.log(parentVisits) / visits);
  let ratio = value / visits;
  uct = Math.floor(100 * uct);
  ratio = Math.floor(100 * ratio);

  if (!parentVisits) uct = null;

  return (
    <div className={classes} onClick={onClick}>
      <li>ratio {ratio}</li>
      {uct && <li>uct {uct}</li>}
      <li>value {value}</li>
      <li>visits {visits}</li>

      {renderState && renderState(state)}
    </div>
  );
};

MCTSNode.propTypes = {
  state: PropTypes.any,
  renderState: PropTypes.func,
  value: PropTypes.any,
  visits: PropTypes.any,
  parentVisits: PropTypes.any,
  isParent: PropTypes.any,
  isRoot: PropTypes.any,
  onClick: PropTypes.any,
};
