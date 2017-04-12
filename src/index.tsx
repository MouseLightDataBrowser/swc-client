import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory} from "react-router";

import 'react-select/dist/react-select.css';

import {App} from "./App";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}/>
    </Router>, rootEl
);
