import React from 'react'
import { Box } from '@chakra-ui/core';

export type WrapperVariant = 'small' | 'regular';

interface wrapperProps {
  variant?: WrapperVariant
}

const Wrapper: React.FC<wrapperProps> = ({children, variant = 'regular'}) => {
    return (
      <Box maxWidth={variant === 'regular' ? "800px" : "400px"} w="100%" mt={8} mx="auto">
        {children}
      </Box>
    );
}

export default Wrapper;