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
    this.state = { root: props.root, preview: null };
  }

  static propTypes = {
    root: PropTypes.any.isRequired,
    renderState: PropTypes.func,
    style: PropTypes.any,
  };

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    this.setState({ root: nextProps.root });
  }

  getParents(node) {
    let t = node;
    let parents = [];
    let id = 0;
    const onClick = root => () => this.setState({ root });
    const onMouseOver = preview => () => this.setState({ preview });

    while (t.parent) {
      const parent = t.parent;
      const { type, args } = t.parentAction.payload;
      const argsFormatted = (args || []).join(',');
      const arrowText = `${type}(${argsFormatted})`;
      parents.push(
        <div className="mcts-action-wrapper" key={id++}>
          <MCTSNode
            onClick={onClick(parent)}
            onMouseOut={() => this.setState({ preview: null })}
            onMouseOver={onMouseOver(parent)}
            renderState={this.props.renderState}
            {...parent}
          />

          <div className="mcts-action">{arrowText}</div>
          <div className="arrow-right" />
        </div>
      );

      t = parent;
    }

    parents.reverse();

    return parents;
  }

  getChildren(node) {
    return node.children.map((child, i) => {
      const { type, args } = child.parentAction.payload;
      const argsFormatted = (args || []).join(',');
      const arrowText = `${type}(${argsFormatted})`;
      let onClick = () => this.setState({ root: child });

      if (child.children.length == 0) {
        onClick = undefined;
      }

      return (
        <div className="mcts-action-wrapper" key={i}>
          <div className="mcts-action">{arrowText}</div>
          <div className="arrow-right" />

          <MCTSNode
            onClick={onClick}
            renderState={this.props.renderState}
            onMouseOut={() => this.setState({ preview: null })}
            onMouseOver={() => this.setState({ preview: child })}
            {...child}
            parentVisits={node.visits}
          />
        </div>
      );
    });
  }

  getPreview() {
    if (!this.state.preview) {
      return null;
    }

    return (
      <MCTSNodeDetails
        {...this.state.preview}
        renderState={this.props.renderState}
      />
    );
  }

  render() {
    const root = this.state.root;

    return (
      <div className="mcts">
        <div className="description">
          <h4>MCTS Visualizer</h4>

          <p>
            The following diagram explains why the bot made this particular
            move.
          </p>
          <p>
            Interactively browse through the MCTS tree by clicking on various
            nodes.
          </p>
          <p>
            The numbers inside the nodes are the number of visits made by the
            algorithm.
          </p>
          <p>
            Unexpanded nodes are marked black. Read more about MCTS{' '}
            <a href="https://jeffbradberry.com/posts/2015/09/intro-to-monte-carlo-tree-search/">
              here
            </a>.
          </p>
        </div>

        <div className="mcts-tree" style={this.props.style}>
          <section className="parents">{this.getParents(root)}</section>

          <section className="root">
            <MCTSNode
              {...root}
              isRoot={true}
              onMouseOut={() => this.setState({ preview: null })}
              onMouseOver={() => this.setState({ preview: root })}
              renderState={this.props.renderState}
            />
          </section>

          <section className="children">{this.getChildren(root)}</section>

          <section className="preview">{this.getPreview()}</section>
        </div>
      </div>
    );
  }
}

export class MCTSNode extends React.Component {
  static propTypes = {
    state: PropTypes.any,
    visits: PropTypes.any,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onClick: PropTypes.func,
    children: PropTypes.any,
  };

  render() {
    let classes = 'mcts-node';

    if (this.props.children.length > 0) {
      classes += ' clickable';
    }

    return (
      <div
        className={classes}
        onClick={this.props.onClick}
        onMouseOut={this.props.onMouseOut}
        onMouseOver={this.props.onMouseOver}
      >
        {this.props.visits}
      </div>
    );
  }
}

export class MCTSNodeDetails extends React.Component {
  static propTypes = {
    state: PropTypes.any,
    renderState: PropTypes.func,
    value: PropTypes.any,
    visits: PropTypes.any,
    parentVisits: PropTypes.any,
    isRoot: PropTypes.any,
    children: PropTypes.any,
  };

  render() {
    const {
      state,
      value,
      visits,
      parentVisits,
      renderState,
      isRoot,
    } = this.props;
    let classes = 'mcts-node-preview';

    if (isRoot) {
      classes += ' mcts-root';
    }

    let uct = value / visits + Math.sqrt(2 * Math.log(parentVisits) / visits);
    let ratio = value / visits;
    uct = Math.floor(100 * uct);
    ratio = Math.floor(100 * ratio);

    if (!parentVisits) uct = null;

    return (
      <div className={classes}>
        <div>
          <li>value {value}</li>
          <li>visits {visits}</li>
          <li>ratio {ratio}</li>
          {uct && <li>uct {uct}</li>}
        </div>

        {renderState && renderState(state)}
      </div>
    );
  }
}
