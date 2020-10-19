import { NextPage } from 'next';
import Wrapper from '../../components/Wrapper';
import { Formik, Form } from 'formik';
import { toErrorMap } from '../../utils/toErrorMap';
import { InputField } from '../../components/InputField';
import { Button, Box, Flex, Link } from '@chakra-ui/core';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link';

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{ newPassword: '' }}
        onSubmit={ async (values, { setErrors }) => {
          const res = await changePassword({
            newPassword: values.newPassword,
            token: typeof router.query.token === 'string' ? router.query.token : ''
          });
          if (res.data?.changePassword.errors) {
            const errMap = toErrorMap(res.data.changePassword.errors);
            if ('token' in errMap) {
              setTokenError(errMap.token);
            }
            setErrors(errMap);
          } else if (res.data?.changePassword.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            ></InputField>
            {tokenError ? 
              <Flex>
                <Box style={{ color:"red" }} mr={4}>{tokenError}</Box>
                <NextLink href="/forgotPassword">
                  <Link>Get a new token</Link>
                </NextLink>
              </Flex> 
              : null}
            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(ChangePassword);
