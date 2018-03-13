import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';

const CustomLink = ( {label, to , activeOnlyWhenExact }) => (
    <Route 
        path={to}
        exact={activeOnlyWhenExact}
        children={ ( { match }) => {
            let active = match ? "active" : "";
            return (
                <li className={`nav-item ${active}`}>
                    <Link className="nav-link" to={to}>{label}</Link>
                </li>    
                )
            }
        }
    />
)
const menus = [
    {
        label : "Trang chủ",
        to: "/",
        activeOnlyWhenExact: true,
    },
    {
        label : "Quản lí công việc",
        to: "/tasks-list",
        activeOnlyWhenExact: false,
    }
];

class Menu extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <Link className="navbar-brand" to="/">Todoapp</Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        { this.showMenu(menus) }
                    </ul>
                </div>
            </nav>
        )
    }

    showMenu = (menus) => {
        let result = null;
        if(menus.length > 0) {
            result = menus.map((menu, index) => {
                return <CustomLink 
                            key={index}
                            label={menu.label}
                            to={menu.to}
                            activeOnlyWhenExact={menu.activeOnlyWhenExact}
                        />
            })
        }
        return result;
    }
}

export default Menu;