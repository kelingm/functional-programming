// import { Didact, DidactDOM } from './Didact4';
// import Didact from './Didact';
// import DidactDOM from './DidactDOM';
import React from 'react';
import ReactDOM from 'react-dom';

const Hello = ({ name, children }) => {
  return <div>{name}</div>;
};

// 1.render方法
// - jsx和vdom： babel调用createElement(设置babel)
// 2. 组件

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stories: [1, 2, 3, 4],
      a: 1,
    };
  }

  render() {
    return (
      <div
      // onClick={() => {
      //   this.setState({ a: 2 });
      // }}
      >
        {this.state.stories.map((t, index) => (
          <p
            key={t}
            onClick={() => {
              this.setState({ stories: [1, 3, 2, 5] });
            }}
          >
            {t}
          </p>
        ))}
      </div>
    );
  }
}
// ReactDOM.render(<div>hello11</div>, document.getElementById('root'));
ReactDOM.render(<App></App>, document.getElementById('root'));
