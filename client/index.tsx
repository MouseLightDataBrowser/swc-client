import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory} from "react-router";

require("file-loader?name=index.html!../index.html");

import {ApolloApp} from "./ApolloApp";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={ApolloApp}/>
    </Router>, rootEl
);
