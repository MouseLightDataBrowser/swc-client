const configurations = {
    port: 5000,
    graphQLPort: 5000,
    graphQLHostname: "swc-api",
    graphQLEndpoint: "graphql",
    staticHostname: "static-api",
    staticEndpoint: "static",
    staticPort: 5000,
    authRequired: true,
    authUser: "mouselight",
    authPassword: "auth_secret" // always override this, but in the event env is not set, don't leave completely open
};

function loadConfiguration() {
    const config = Object.assign({}, configurations);

    config.port = parseInt(process.env.SWC_CLIENT_PORT) || config.port;
    config.graphQLHostname = process.env.SWC_API_HOST || process.env.CORE_SERVICES_HOST || config.graphQLHostname;
    config.graphQLPort = parseInt(process.env.SWC_API_PORT) || config.graphQLPort;
    config.staticHostname = process.env.STATIC_API_HOST || process.env.CORE_SERVICES_HOST || config.staticHostname;
    config.staticPort = parseInt(process.env.STATIC_API_PORT) || config.staticPort;
    config.authRequired = process.env.SWC_AUTH_REQUIRED !== "false";
    config.authUser = process.env.SWC_AUTH_USER || config.authUser;
    config.authPassword = process.env.SWC_AUTH_PASS || config.authPassword;

    return config;
}

export const ServiceOptions = loadConfiguration();
