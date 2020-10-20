import React from 'react'
import { Box, Link, Flex, Button, Heading, Avatar } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [{fetching: logoutFetching}, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer()       // to skip this query if SSR is enabled
  });

  let body;
  if (fetching) {
    // data is loading
    body = null;

  } else if (!data?.me) {
    // user is not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    // user is logged in
    body = (
      <>
        <Flex position="sticky" zIndex={1} top={0} align="center">
          <NextLink href="/create-post">
            <Button as={Link} mr={4}>Create Post</Button>
          </NextLink>
          <Avatar mr={2} color="white" name={data.me.username} title={data.me.username}></Avatar>
          <Button 
            color="white"
            onClick={ async () => {
              await logout();
              router.reload();
            }} 
            isLoading={logoutFetching}
            variant="link">logout</Button>
        </Flex>
      </>
    )
  }
  return (
    <>
      <Flex position="sticky" zIndex={1} top={0} bg="primary.700" p={4} align="center">
        <Flex flex={1} align="center" m="auto" maxW={800}>
          <NextLink href="/">
            <Link>
              <Heading color="white">Forum</Heading>
            </Link>
          </NextLink>
          <Box ml={'auto'}>
            {body}
          </Box>
        </Flex>
      </Flex>
    </>
  );
}