import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const PORT = "4002";
const PROTOCOL = window.location.protocol;
const HOSTNAME = window.location.hostname;
const URL = `${PROTOCOL}//${HOSTNAME}:${PORT}`;
const WSURL = `ws://${HOSTNAME}:${PORT}`;

const PDFEXPORT = `${PROTOCOL}//${HOSTNAME}:${1400}/pdfExport`;

const wsLink = new WebSocketLink({
  // uri: process.env.REACT_APP_WS_URL,
  // uri: "ws://localhost:4002/graphql",
  // uri: "ws://10.0.0.153:4002/graphql",
  // uri: "ws://69.46.4.34:4002/graphql",
  // uri: "ws://37d2-152-169-45-70.ngrok-free.app/graphql",
  uri: `${WSURL}/graphql`,
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({
  // uri: process.env.REACT_APP_GRAPHQL_URL,
  // uri: "http://10.0.0.153:4002/graphql",
  // uri: "http://69.46.4.34:4002/graphql",
  // uri: "https://37d2-152-169-45-70.ngrok-free.app/graphql",
  uri: `${URL}/graphql`,
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const Client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default Client;
