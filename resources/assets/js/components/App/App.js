import React, { Component } from "react";
import Menu from "./../Menu/Menu";
import routes from './../../routes';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
class App extends Component {
    render() {
        return (
            <Router>
                <div className='container'>
                    <Menu />
                    <div className='content'>
                        { this.showContent(routes) }
                    </div>
                    
                </div>
            </Router>
        );
    }
    showContent = (routes) => {
        let result = null;
        if (routes.length > 0) {
            result = routes.map((route, index) => {
                return <Route key={index}
                        path={route.path}
                        exact={route.exact}
                        component={route.main}
                />
            });
        }

        return <Switch>{result}</Switch>;
    }

}
export default App;