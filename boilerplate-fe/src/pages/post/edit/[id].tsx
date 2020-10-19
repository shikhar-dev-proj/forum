import React from 'react'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import Layout from '../../../components/Layout';
import { Formik, Form } from 'formik';
import { InputField } from '../../../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';

const EditPost = ({}) => {
  const router = useRouter();
  const [, updatePost] = useUpdatePostMutation();
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId
    }
  });
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
    <Layout variant="small">
      <Formik 
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={ async (values) => {
          await updatePost({ id: intId, ...values });
          router.back();
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
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(EditPost);