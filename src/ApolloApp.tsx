import * as React from "react";
import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
import createNetworkInterface from "apollo-upload-network-interface"

import {App} from "./App";

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

interface IApolloAppProps {
}

interface IApolloAppState {
}

export class ApolloApp extends React.Component<IApolloAppProps, IApolloAppState> {
    public render() {
        return (
            <ApolloProvider client={client}>
                <App children={this.props.children}/>
            </ApolloProvider>
        );
    }
}
