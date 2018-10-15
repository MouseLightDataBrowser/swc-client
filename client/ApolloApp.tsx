import * as React from "react";
import {ApolloClient} from "apollo-client";
import {createUploadLink} from "apollo-upload-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {ApolloProvider} from "react-apollo";

import {App} from "./App";

const client = new ApolloClient({
    link: createUploadLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

export const ApolloApp = () => (
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
);
