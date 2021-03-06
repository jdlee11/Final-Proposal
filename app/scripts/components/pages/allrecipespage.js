import React from 'react';
import Header from '../header';
import recipeCollection from '../../collections/recipes';
import session from '../../models/session';
import RecipeHome from '../recipehome';
import $ from 'jquery';

let AllRecipesPage = React.createClass({
  getInitialState: function(){
    return {
      loggedIn: (session.get('authtoken')),
      recipes: recipeCollection.toJSON(),
      page: 0,
      canPageLeft: false,
      canPageRight: false,
      maxPage: 0,
      maxItems: 6,
      retrievedPage: false, // found it necessary to wait for all the page's recipes to be fetched
      searchTerms: [],
      searchOpen: false,
      allSearchTerms: ["all recipes", "quick", "easy", "chicken", "spicy", "meat", "vegetarian", "breakfast", "american"]
    };
  },
  componentDidMount: function(){
    if (!localStorage.getItem('authtoken')){
      session.save({username: 'anonymous', password: 'password'},
      {
        url: session.urlRoot,
        success: (response) => {
          this.setState({loggedIn: true});
          localStorage.setItem('authtoken', response.toJSON().authtoken);
          localStorage.setItem('userId', response.toJSON()._id);
          localStorage.setItem('username', response.toJSON().username);
          recipeCollection.fetch({
            url: `${recipeCollection.url}/_count`,
            success: (response, count) => {
              this.setState({maxPage: Math.ceil(count.count/2) - 1}); // change back to 10
              this.fetchData();
            }
          });
        }
      });
    } else {
      this.getPageData();
    }
  },
  toggleSearch: function(evt){
    let term = evt.target.innerText.replace(" ", "");
    let index = this.state.searchTerms.indexOf(term);
    if (index !== -1){
      let newSearchTerms = this.state.searchTerms;
      newSearchTerms.splice(index, 1);
      this.setState({searchTerms: newSearchTerms});
    } else if (term !== ""){
      this.setState({searchTerms: this.state.searchTerms.concat(term)});
    }
    this.setState({page: 0});
    this.setState({canPageLeft: false});
    this.setState({canPageRight: false});
    setTimeout(() => {
      this.getPageData();
    }, 50);
  },
  fetchData: function(){
    $('input').prop('checked', false);
    recipeCollection.fetch({

      url: `${recipeCollection.url}?query={}&limit=${this.state.maxItems + 1}&skip=${this.state.page * this.state.maxItems}`,
      success: (response, queryResponse) => {
        this.setState({recipes: queryResponse, retrievedPage: true});
        this.setState({retrievedPage: true});
        if (queryResponse.length > this.state.maxItems){
          this.setState({canPageRight: true});
        } else {
          this.setState({canPageRight: false});
        }
      }
    });
  },
  nextPage: function(){
    this.setState({page: this.state.page + 1, canPageLeft: true, retrievedPage: false});
    setTimeout(() => {
      this.getPageData();
    }, 50);
  },
  previousPage: function(){
    this.setState({page: this.state.page - 1, retrievedPage: false});
    setTimeout(() => {
      if (this.state.page === 0){
        this.setState({canPageLeft: false});
      }
      this.getPageData();
    }, 50);
  },
  getPageData: function(){
    this.setState({retrievedPage: false});
    if (this.state.searchTerms.length === 0){
      this.fetchData();
    } else {
      recipeCollection.fetch({
        data: {
          query: JSON.stringify({
            keywords: {
              $all: this.state.searchTerms
            }
          }),
          limit: this.state.maxItems + 1,
          skip: (this.state.page * this.state.maxItems)
        },
        success: (response, queryResponse) => {
          this.setState({recipes: queryResponse});
          this.setState({retrievedPage: true});
          if (queryResponse.length > this.state.maxItems){
            this.setState({canPageRight: true});
          } else {
            this.setState({canPageRight: false});
          }
        }
      });
    }
  },
  openSearch: function(evt){
    if (evt.target.tagName === "DIV"){
      if (this.state.searchOpen){
        this.setState({searchOpen: false});
      } else {
        this.setState({searchOpen: true});
      }
    }
  },
  render: function(){
    let recipeList;
    let nav;
    let searchTermList = this.state.allSearchTerms.map((item, i) => {
      if (item === "all recipes"){
        return (<a onClick={this.fetchData} key={i}>{item}</a>);
      }
      return (<label onClick={this.toggleSearch} key={i}><input type="checkbox" value={item}/> {item}</label>);
    });
    let sideBar;
    if (this.state.searchOpen) {
      sideBar = (
        <div className="sidebar open-sidebar" onClick={this.openSearch}>
          {searchTermList}
        </div>
      );
    } else {
      sideBar = (
        <div className="sidebar" onClick={this.openSearch}>
          {searchTermList}
        </div>
      );
    }

    if (this.state.retrievedPage){
      recipeList = this.state.recipes.map((item, i) => {
        if (i < this.state.maxItems){
          return (<RecipeHome recipe={item} key={i} />);
        }
      });
      if (this.state.recipes.length === 0){
        recipeList = <h1>No matching recipes found</h1>
      }
      let leftArrow;
      if (this.state.canPageLeft){
        leftArrow = (
          <img className="recipe-page-arrow float-left" src="assets/page_left.png" onClick={this.previousPage}/>
        );
      } else {
        leftArrow = (
          <img className="recipe-page-arrow float-left" src="assets/page_left_off.png"/>
        );
      }
      let rightArrow;
      if (this.state.canPageRight){
        rightArrow = (
          <img className="recipe-page-arrow float-right" src="assets/page_right.png" onClick={this.nextPage}/>
        );
      } else {
        rightArrow = (
          <img className="recipe-page-arrow float-right" src="assets/page_right_off.png"/>
        );
      }
      nav = (
        <nav className="recipe-page-nav">
          {leftArrow}
          <p>{`page ${this.state.page + 1}`}</p>
          {rightArrow}
        </nav>
      );
    } else {
      recipeList = (
        <h1>Loading...</h1>
      );
    }
    return (
      <div>
        <Header />
        <div className="all-recipes">
          {sideBar}
          <div className="recipes-list-container">
              {recipeList}
          </div>
          {nav}
        </div>
      </div>
    );
  }
  // add arrow buttons
  // if this.state.page === 0, left disabled
  // if this.state.page === this.state.maxPage, right disabled
});

export default AllRecipesPage;
