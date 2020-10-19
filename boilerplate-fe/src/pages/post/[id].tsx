import React from 'react'
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { usePostQuery, useMeQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Heading, Box } from '@chakra-ui/core';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';

const Post = ({}) => {
  const router = useRouter();
  const [{ data: meData }] = useMeQuery();
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,     // don't send request to server if id is -1
    variables: {
      id: intId
    }
  });
  router.query.id;
  if (error) {
    return (
      <div>{error.message}</div>
    )
  }
  if (fetching) {
    return (
      <Layout>
        <div>loading ...</div>
      </Layout>
    )
  }
  if (!data?.post) {
    return (
      <Layout>
        Could not find your post
      </Layout>
    )
  }
  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={4}>
        {data.post.text}
      </Box>
      {meData?.me?.id !== data.post.creator.id ? null 
        : <EditDeletePostButtons id={intId} />
      }
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true})(Post);