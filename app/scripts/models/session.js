import Backbone from 'backbone';
import settings from '../settings';
import { hashHistory } from 'react-router';
import store from '../store';

const Session = Backbone.Model.extend({
  urlRoot: `https://baas.kinvey.com/user/${settings.appId}/login`,
  defaults: {
    username: '',
    authtoken: ''
  },
  parse: function(response) {
    if (response) {
      return {
        authtoken: response._kmd.authtoken,
        username: response.username,
        userId: response._id
      };
    }
  },
  login: function(username, password, newUrl) {
    this.save({username: username, password: password}, {
      url: newUrl || this.urlRoot,
      success: (model, response) => {
        this.unset('password');

        // when signing up, create new user model
        if (newUrl) {
          store.users.create(username, {
            success: function(response) {
              console.log('added to collection');
              console.log(response);
            }
          })
        }
        hashHistory.push("recipes");
      },
      error: function(){
        console.log("could not log in");
      }
    });
  }
});

let session = new Session();

export default session;