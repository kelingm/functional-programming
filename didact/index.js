import { Didact, DidactDOM } from './Didact';
// import React, { ReactDOM } from 'react';
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

const rootDom = document.getElementById('root');
// DidactDOM.render(<Welcome />, rootDom);

// ReactDom.render(App, root);

// 1.render方法
// - jsx和vdom： babel调用createElement(设置babel)
// 2. 组件

// function tick() {
//   const time = new Date().toLocaleTimeString();
//   const clockElement = <h1>{time}</h1>;
//   DidactDOM.render(clockElement, rootDom);
// }
// tick();
// setInterval(tick, 1000);

const randomLikes = () => Math.ceil(Math.random() * 100);

class App extends Didact.Component {
  constructor(props) {
    super(props);
    this.state = {
      stories: [1, 2, 3, 4],
    };
  }
  handleClick = story => {
    let a = [].concat(this.state.stories);
    a.splice(
      a.findIndex(item => item.name === story.name),
      1,
    );
    console.log({ a });
    this.setState({
      stories: a,
    });
  };

  render() {
    return (
      <div>
        {this.state.stories.map((t, index) => (
          <button
            key={t}
            onClick={() => {
              this.setState({ stories: [1, 3, 4, 5, 6] });
            }}
          >
            {t}
          </button>
        ))}
      </div>
    );
  }
}
const StoryElement = ({ story, handleClick }) => {
  return (
    <li>
      <button onClick={e => handleClick(story)}>
        {story.likes}
        <b>❤️</b>
      </button>
      <a href={story.url}>{story.name}</a>
    </li>
  );
};

DidactDOM.render(<App />, document.getElementById('root'));
