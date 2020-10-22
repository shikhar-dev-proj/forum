import React from 'react'
import { Box, Icon, IconButton, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useDeletePostMutation } from '../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id}) => {
  const [, deletePost] = useDeletePostMutation();
  return (
    <Box>
      <Icon 
        cursor="pointer"
        name="chat" 
        color="primary.600"
        aria-label="Delete Post"
        mr={4} 
        onClick={() => {
          // deletePost({ id })
        }} />
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <Icon 
          // as={Link}
          cursor="pointer"
          color="primary.600"
          name="edit" 
          aria-label="Edit Post" 
          mr={4} />
      </NextLink>
      <Icon 
        cursor="pointer"
        name="delete" 
        color="primary.600"
        aria-label="Delete Post" 
        onClick={() => {
          deletePost({ id })
        }} />
      
    </Box>
  );
}

export default EditDeletePostButtons;