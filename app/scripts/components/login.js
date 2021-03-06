import React from 'react';
import session from '../models/session';
import Header from './header';

let Login = React.createClass({
  // use state to show error
  loginFunction: function(evt){
    evt.preventDefault();
    let username = this.refs.username.value;
    let password = this.refs.password.value;
    session.login(username, password);
  },
  render: function(){
    return (
      <div className="login-container">
        <Header />
        <div className="login-div">
          <h2>Log in</h2>
          <form onSubmit={this.loginFunction}>
            <input type="text" placeholder="username" ref="username"/>
            <input type="password" placeholder="password" ref="password"/>
            <input type="submit" value="Submit"/>
          </form>
        </div>
        {this.props.children}
      </div>
    );
  }
});

export default Login;
