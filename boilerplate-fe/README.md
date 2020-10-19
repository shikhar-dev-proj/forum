## BOILERPLATE_WEB

https://github.com/vercel/next.js/tree/canary/examples/with-chakra-ui

yarn create next-app --example with-chakra-ui with-chakra-ui-app

Use the above link to create next.js app with chakra-ui

#### Setup with TS

yarn add --dev typescript @types/node

#### Setting  up with graphql

yarn add urql graphql

urql for graphql

#### Setting Codegen (looks at graphql queries and generates TS types and URQL hooks)
yarn add -D @graphql-codegen/cli
yarn add -D @graphql-codegen/typescript-urql

Add graphql queries/mutations to graphql folder and run:
yarn gen
This will generate TS types in generated folder, which can be used (eg: useRegisterMutation, useLoginMutation) 

#### Normalized urql cache

yarn add @urql/exchange-graphcache

For Custom Updates check app.tsx cacheExchange configurations.

#### Server Side Rendering

yarn add next-urql react-is isomorphic-unfetch

notice this command: export default withUrqlClient(createUrqlClient, { ssr: true })(Index) in pages.








