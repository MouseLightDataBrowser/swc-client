import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, IndexRedirect, browserHistory} from "react-router";

import {App} from "./App";
import {Home} from "./Home";
import {Tracings} from "./Tracings";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRedirect to="home"/>
            <Route path="home" component={Tracings}/>
        </Route>
    </Router>, rootEl
);
