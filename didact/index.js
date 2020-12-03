import { Didact, DidactDOM } from './Didact';

class Welcome extends Didact.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }
  // componentDidMount() {
  //   setTimeout(() => {
  //     this.setState({
  //       count: 1,
  //     });
  //   }, 1000);
  // }
  onClick = () => {
    for (let i = 0; i < 10; i++) {
      this.setState(prevState => {
        return {
          count: prevState.count + 1,
        };
      });
    }
  };
  render() {
    return (
      <div
        onClick={this.onClick}
        className="welcome"
        style={{ height: '100px', backgroundColor: 'red' }}
      >
        {/* <Hello name={this.state.count + 1} /> */}
        {this.state.count > 9 && <Hello name={this.state.count + 1} />}
        welcome: {this.state.count}
        {/* {this.state.count < 20 && <div>test</div>} */}
      </div>
    );
  }
}
const App = () => (
  <div className="app" key="app" style={{ backgroundColor: 'red' }}>
    <p>11</p>
    <p>22</p>
    <Welcome />
  </div>
);

// class Hello extends Didact.Component {
//   render() {
//     return <div>hello world {this.props.name}</div>;
//   }
// }
const Hello = ({ name } = {}) => {
  return <div>hello world {name}</div>;
};
DidactDOM.render(<Welcome />, document.getElementById('root'));
// ReactDom.render(App, root);

// 1.render方法
// - jsx和vdom： babel调用createElement(设置babel)
// 2. 组件