import { combineReducers } from 'redux';
import tasks from './tasks';
import editTask from './editTask';
import txtSearch from './searchTask';

const appReducers = combineReducers({
    tasks,
    editTask,
    txtSearch
});
export default appReducers;