import React, { Component } from "react";
import "./Search.css";
class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            txtSearch : ""
        }
    }
    handleChange = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name] : value 
        })
    }
    handleSubmit = () => {
        this.props.onSearch(this.state.txtSearch);
    }

    render() {
        return (         
            <div className='col-5'>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" placeholder="Nhập từ khóa" 
                            name='txtSearch'
                            value={this.state.txtSearch}
                            onChange={this.handleChange}
                    />
                    <input type="button" className='btn btn-info' value="Tìm kiếm" onClick={this.handleSubmit}></input>
                </div>
            </div>
        );
    }
}
export default Search;