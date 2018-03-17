import * as Types from './../constants/ActionsType';

var initialState = {
    by : "level",
    dir : -1
};

const searchTask = (state = initialState, action) => {
    switch(action.type){
        case Types.SORT_TASK: 
            return action.sort;
        default :
            return state; 
    }
}

export default searchTask;