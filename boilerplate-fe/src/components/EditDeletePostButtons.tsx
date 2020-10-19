import React from 'react'
import { Box, IconButton, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useDeletePostMutation } from '../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id}) => {
  const [, deletePost] = useDeletePostMutation();
  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton 
          as={Link}
          icon="edit" 
          aria-label="Edit Post" 
          mr={4} />
      </NextLink>
      <IconButton 
        icon="delete" 
        aria-label="Delete Post" 
        onClick={() => {
          deletePost({ id })
        }} />
    </Box>
  );
}

export default EditDeletePostButtons;