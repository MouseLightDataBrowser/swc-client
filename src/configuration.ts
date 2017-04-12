const configurations: any = {
    development: {
        port: 9653,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "localhost",
        graphQLPort: 9651
    },
    test: {
        port: 9653,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "swc-api",
        graphQLPort: 9651
    },
    production: {
        port: 9663,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "swc-api",
        graphQLPort: 9651
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
