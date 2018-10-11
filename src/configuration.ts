const configurations: any = {
    development: {
        port: 5000,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "localhost",
        graphQLPort: 5000
    },
    test: {
        port: 5000,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "swc-api",
        graphQLPort: 5000
    },
    production: {
        port: 5000,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "swc-api",
        graphQLPort: 5000
    }
};

export const Configuration = LoadConfiguration();

function LoadConfiguration() {
    let env = process.env.NODE_ENV || "development";

    let config = configurations[env];

    config.port = process.env.SWC_CLIENT_PORT || config.port;
    config.graphQLHostname = process.env.SWC_API_HOST || config.graphQLHostname;
    config.graphQLPort = process.env.SWC_API_PORT || config.graphQLPort;

    return config;
}
