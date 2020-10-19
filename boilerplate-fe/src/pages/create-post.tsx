import React, { useEffect } from 'react'
import Wrapper from '../components/Wrapper';
import { Formik, Form } from 'formik';
import login from './login';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from '../components/InputField';
import { Box, Flex, Link, Button } from '@chakra-ui/core';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter, Router } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import Layout from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
  useIsAuth();
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  return (
    <Layout variant="small">
      <Formik 
        initialValues={{ title: '', text: '' }}
        onSubmit={ async (values, { setErrors }) => {
          const {error} = await createPost({ input: values });
          if (error) {
            router.push('/');
          }
          router.push('/');
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="title"
              label="Title"
            ></InputField>
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="Enter your text ..."
                label="Body"
              ></InputField>
            </Box>
            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(CreatePost);