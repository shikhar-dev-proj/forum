import React, { useState } from 'react'
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { usePostQuery, useMeQuery, useCommentOnPostMutation } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Heading, Box, Icon, Flex, Avatar, Text, Stack, Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/core';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Post = ({}) => {
  const [comment, setComment] = useState('');
  const router = useRouter();
  const [{ data: meData }] = useMeQuery();
  const [, commentOnPost] = useCommentOnPostMutation();
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
  const sortedCommentsByRecency = data.post.comments.sort((cA, cB) => (+cB.createdAt) - (+cA.createdAt));
  return (
    <Layout>
      <Flex mb={4}>
        <Heading>{data.post.title}</Heading>
        <Flex alignItems="center" justifyContent="center" ml={'auto'}>
          {meData?.me?.id !== data.post.creator.id ? null 
            : <EditDeletePostButtons id={intId} />
          }
        </Flex>
      </Flex>
      <Box
        backgroundColor="#fafafa"
        border="1px solid #eaeaea"
        borderRadius={4}
        padding="1.25rem"
        mb={4}
        >
        {data.post.text}
      </Box>
      <Box>
        <Heading size="md" mb={2}>Comments Array</Heading>
        <Stack spacing={2}>
          <Box borderBottom="1px solid #eaeaea" p={2}>
            <InputGroup size="lg">
              <InputLeftElement children={
                <Avatar name={meData?.me?.username} size="sm"></Avatar>
              } />
              <Input value={comment} 
                onChange={(evt: any) => setComment(evt.target.value)} 
                placeholder="Tell us what do you think." />
              <InputRightElement children={
                <Icon name="chat"
                  color="primary.500"
                  cursor="pointer"
                  onClick={() => {
                    if (comment) {
                      commentOnPost({ postId: data.post!.id, value: comment });
                    }
                    setComment('');
                  }}
                  ></Icon>
              } />
            </InputGroup>
          </Box>
          {sortedCommentsByRecency.map(c => 
            <Box borderBottom="1px solid #eaeaea" p={4}>
              <Flex mb={2} alignItems="center">
                <Avatar name={c.commenter} size="sm"></Avatar>
                <Box ml={2}>
                  <Heading size="sm">{c.commenter}</Heading>
                  <Text fontSize="xs" color="gray.500">{dayjs(+(c.createdAt)).fromNow()}</Text>
                </Box>
              </Flex>
              <Box>
                {c.message}
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
      
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true})(Post);