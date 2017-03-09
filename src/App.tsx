import * as React from "react";
import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
// import {createNetworkInterface} from "apollo-client";
import createNetworkInterface from 'apollo-upload-network-interface'

declare let window: {__APOLLO_STATE__: any};

const networkInterface = createNetworkInterface({
    uri: "/graphql"
});

// const wsClient = new Client("ws://localhost:8080");

// const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
//    networkInterface,
//    wsClient,
// );

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

export class App extends React.Component<any, any> {
    render() {
        return (
            <ApolloProvider client={client}>
                <div>
                    {this.props.children}
                </div>
            </ApolloProvider>
        );
    }
}