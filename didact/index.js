import { Didact, DidactDOM } from './Didact4';
// import React from 'react';
// import ReactDOM from 'react-dom';

const Hello = ({ name, children }) => {
  return (
    <div>
      hello world {name}
      {name > 2 && 'hah'}
      {name < 5 && 'eee'}
      {children}
    </div>
  );
};

// 1.render方法
// - jsx和vdom： babel调用createElement(设置babel)
// 2. 组件

class App extends Didact.Component {
  constructor(props) {
    super(props);
    this.state = {
      stories: [1, 2, 3, 4],
    };
  }

  render() {
    return (
      <div>
        {this.state.stories.map((t, index) => (
          <button
            key={t}
            onClick={() => {
              this.setState({ stories: [3, 4] });
            }}
          >
            {t}
            {/* {t > 2 ? <span>{t}</span> : <p>{t}</p>} */}
          </button>
        ))}
      </div>
    );
  }
}
DidactDOM.render(<App />, document.getElementById('root'));
