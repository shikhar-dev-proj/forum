import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery, useDeletePostMutation, useMeQuery } from './../generated/graphql';
import Layout from "../components/Layout";
import NextLink from 'next/link';
import { Link, Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/core";
import { useState } from "react";
import { Upvote } from "../components/Upvote";
import EditDeletePostButtons from "../components/EditDeletePostButtons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string
  });
  const [{ data: meData }] = useMeQuery();
  const [{data, fetching}] = usePostsQuery({variables});


  if (!data && !fetching) {
    return <div>Post query failed.</div>;
  }

  return (
    <Layout>
      {!data && fetching ? (
        <div>Loading ...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map(p => !p ? null :
            // <div key={p.id}>{p.title}</div>
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <Upvote post={p}/>
              <Box flex={1}>
              <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize="xl">{p.title}</Heading> 
                  </Link>
                </NextLink>
                <Text>posted by {p.creator.username}</Text>
                <Flex align="center" justifyContent="center">
                  <Text flex={1} mt={4}>{p.textSnippet}</Text>
                  {meData?.me?.id !== p.creator.id 
                    ? null 
                    : <Box ml="auto">
                        <EditDeletePostButtons id={p.id}/>
                      </Box>
                  }
                </Flex>
              </Box>
            </Flex>
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button onClick={() => {
            setVariables({ 
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
            });
          }} isLoading={fetching} m="auto" my={8}>load more</Button>
        </Flex>
      ) : null}
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
