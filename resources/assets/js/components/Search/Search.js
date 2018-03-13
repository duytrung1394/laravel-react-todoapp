import React, { Component } from "react";
import "./Search.css";
class Search extends Component {
    render() {
        return (         
            <div className='col-5'>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" placeholder="Nhập từ khóa" />
                    <input type="button" className='btn btn-info' value="Tìm kiếm"></input>
                </div>
            </div>
        );
    }
}
export default Search;