import React, { useState } from 'react'
import { Flex, IconButton } from '@chakra-ui/core';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpvoteProps {
  post: PostSnippetFragment
}

export const Upvote: React.FC<UpvoteProps> = ({post}) => {
  const [loadingState, setLoadingState] = useState<'upvoteLoading' | 'downvoteLoading' | 'notLoading'>('notLoading'); 
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton 
        aria-label="upvote" 
        icon="chevron-up"
        variantColor={post.voteStatus === 1 ? "green" : undefined}
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
        />
      {post.points}
      <IconButton 
        aria-label="downvote"
        icon="chevron-down"
        variantColor={post.voteStatus === -1 ? "red" : undefined}
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
        />
    </Flex>
  );
}