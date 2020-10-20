import { dedupExchange, fetchExchange, Exchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from './betterUpdateQuery';
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import gql from 'graphql-tag';
import { isServer } from "./isServer";

export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
}

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
  fieldInfos.forEach(fi => {
    cache.invalidate('Query', 'posts', fi.arguments || {});
  });
}

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // all queries in cache
    const allFields = cache.inspectFields(entityKey);

    // filter out ones which are not posts
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(cache.resolveFieldByKey(entityKey, fieldKey) as string, 'posts');
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore') as boolean;

      if (!_hasMore) {
        hasMore = _hasMore;
      }
      results.push(...data);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    };
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  return ({
  url: process.env.NEXT_PUBLIC_API_URL as string,
  fetchOptions: {
    credentials: 'include' as const,
    headers: cookie ? { cookie } : undefined,
  },
  // this code below helps in updating the cache for MeQuery everytime user logs in or registers
  exchanges: [dedupExchange, cacheExchange({
    keys: {
      PaginatedPosts: () => null   // to tell that id is not present on PaginatedPosts
    },
    resolvers: {
      Query: {
        posts: cursorPagination()
      }
    },
    updates: {
      Mutation: {
        deletePost: (_result, args, cache, info) => {
          cache.invalidate({ 
            __typename: 'Post',
            id: (args as DeletePostMutationVariables).id
          });
        },
        vote: (_result, args, cache, info) => {
          const { postId, value } = args as VoteMutationVariables;
          const data = cache.readFragment(
            gql`
              fragment _ on Post {
                id
                ups
                downs
                voteStatus
              }
            `,
            { id: postId } as any
          );
          if (data) {
            if (data.voteStatus === value) {
              return;
            }
            const newUps = (data.ups as number) + (value > 0 ? 1 : (!data.voteStatus ? 0 : -1));
            const newDowns = (data.downs as number) + (value < 0 ? 1 : (!data.voteStatus ? 0 : -1))
            // const newUps = (data.ups as number) + ((!data.voteStatus ? 1 : 2) * value);
            cache.writeFragment(
              gql`
                fragment __ on Post {
                  ups
                  downs
                  voteStatus
                }
              `,
              { id: postId, ups: newUps, downs: newDowns, voteStatus: value } as any
            );
          }
        },
        createPost: (_result, args, cache, info) => {
          invalidateAllPosts(cache);
        },
        logout: (_result, args, cache, info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            () => ({me: null})
          )
        },
        login: (_result, args, cache, info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.login.errors) {
                return query;
              } else {
                return {
                  me: result.login.user,
                }
              }
            }
          );
          invalidateAllPosts(cache);
        },
        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache,
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.register.errors) {
                return query;
              } else {
                return {
                  me: result.register.user,
                }
              }
            }
          );
        }
      }
    }
  }),
  ssrExchange,
  fetchExchange],
})
};