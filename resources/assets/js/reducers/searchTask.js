import * as Types from './../constants/ActionsType';

var initialState = "";

const searchTask = (state = initialState, action) => {
    switch(action.type){
        case Types.SEARCH_TASK: 
            return action.txtSearch;
        default :
            return state; 
    }
}

export default searchTask;