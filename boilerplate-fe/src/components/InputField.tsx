import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/core';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({label, textarea, size: _, ...props}) => {
  const [field, {error}] = useField(props);
  let InputOrTextArea = textarea ? Textarea : Input;
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextArea {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}