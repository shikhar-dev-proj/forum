import React, { useState } from 'react'
import { Button, ButtonGroup, Flex, IconButton } from '@chakra-ui/core';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpvoteProps {
  post: PostSnippetFragment
}

export const Upvote: React.FC<UpvoteProps> = ({post}) => {
  const [loadingState, setLoadingState] = useState<'upvoteLoading' | 'downvoteLoading' | 'notLoading'>('notLoading'); 
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <Button
        aria-label="upvote" 
        rightIcon="chevron-up"
        flexDirection="row"
        m={1}
        variantColor={post.voteStatus === 1 ? "primary" : undefined}
        isLoading={loadingState === 'upvoteLoading'}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState('upvoteLoading');
          await vote({
            postId: post.id,
            value: 1
          });
          setLoadingState('notLoading')
        }}
      >
        {post.ups}
      </Button>
      
      <Button 
        aria-label="downvote"
        rightIcon="chevron-down"
        flexDirection="row"
        m={1}
        variantColor={post.voteStatus === -1 ? "error" : undefined}
        isLoading={loadingState === 'downvoteLoading'}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState('downvoteLoading');
          await vote({
            postId: post.id,
            value: -1
          });
          setLoadingState('notLoading')
        }}
        >
          {post.downs}
        </Button>
    </Flex>
  );
}