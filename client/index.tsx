import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory} from "react-router";

require("file-loader?name=index.html!../index.html");

// TODO Remove after removing bootstrap
import "../assets/mouselight.bootstrap.css";
import "../assets/style.css";

// TODO remove after replacing slider
import "rc-slider/assets/index.css";

import "react-toastify/dist/ReactToastify.min.css";

import {ApolloApp} from "./ApolloApp";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={ApolloApp}/>
    </Router>, rootEl
);
