import * as React from "react";
import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
import createNetworkInterface from 'apollo-upload-network-interface'
import {Navbar, Nav, Glyphicon, NavItem} from "react-bootstrap";
import {ToastContainer} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.min.css';
import 'rc-slider/assets/index.css';

import {Content} from "./Content";

declare let window: { __APOLLO_STATE__: any };

const networkInterface = createNetworkInterface({
    uri: "/graphql"
});

const client = new ApolloClient({
    networkInterface: networkInterface,
    addTypename: true,
    dataIdFromObject: (result: any) => {
        if (result.id) {
            return result.__typename + result.id;
        }
        return null;
    },
    initialState: window.__APOLLO_STATE__,
    connectToDevTools: true
});

interface IHeadingProps {
    onSettingsClick(): void;
}

interface IHeadingState {
}

class Heading extends React.Component<IHeadingProps, IHeadingState> {
    public render() {
        return (
            <Navbar fluid fixedTop style={{marginBottom: 0}}>
                <Navbar.Header>
                    <Navbar.Brand>
                        Mouse Light Tracing Manager
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        <NavItem onSelect={() => this.props.onSettingsClick()}>
                            <Glyphicon glyph="cog"/>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>);
    }
}

const Footer = () => (
    <div className="container-fluid footer">
        Mouse Light Neuron Data Browser Copyright © 2016 - 2017 Howard Hughes Medical Institute
    </div>
);

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

interface IAppProps {
}

interface IAppState {
    isSettingsOpen?: boolean;
}

export class App extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);

        this.state = {
            isSettingsOpen: false
        }
    }

    private onSettingsClick() {
        this.setState({isSettingsOpen: true}, null);
    }

    private onSettingsClose() {
        this.setState({isSettingsOpen: false}, null);
    }

    render() {
        return (
            <ApolloProvider client={client}>
                <div>
                    <ToastContainer autoClose={6000} position="bottom-center" style={toastStyleOverride}/>
                    <Heading onSettingsClick={() => this.onSettingsClick()}/>
                    <Content isSettingsOpen={this.state.isSettingsOpen} onSettingsClose={() => this.onSettingsClose()}/>
                    <Footer/>
                </div>
            </ApolloProvider>
        );
    }
}