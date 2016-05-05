import React from 'react';

import Navigation from '../components/navigation';
import SearchBar from '../components/search';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSearch: false
    };
  }

  toggleSearch() {
    this.setState({
      showSearch: !this.state.showSearch
    });
  }

  render() {
    return (
      <div>
        <Navigation
          location={this.props.location}
          toggleSearch={this.toggleSearch.bind(this)}
          showSearch={this.state.showSearch} />
        <SearchBar showSearch={this.state.showSearch} />
        {this.props.children}
      </div>
    );
  };
};
