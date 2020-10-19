import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]): Record<string, string> => {
  return errors.reduce((acc, { field, message }) => ({ ...acc, [field]: message }), {});
}