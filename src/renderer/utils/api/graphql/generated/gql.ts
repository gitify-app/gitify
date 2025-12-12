/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment AuthorFields on Actor {\n    login\n    url\n    avatar_url: avatarUrl\n    type: __typename\n  }\n": typeof types.AuthorFieldsFragmentDoc,
    "\n  fragment CommentFields on DiscussionComment {\n    databaseId\n    createdAt\n    author {\n      ...AuthorFields\n    }\n  }\n": typeof types.CommentFieldsFragmentDoc,
    "\n  query fetchDiscussionByNumber(\n    $owner: String!\n    $name: String!\n    $number: Int!\n    $lastComments: Int\n    $lastReplies: Int\n    $firstLabels: Int\n    $includeIsAnswered: Boolean!\n  ) {\n    repository(owner: $owner, name: $name) {\n      discussion(number: $number) {\n        __typename\n        number\n        title\n        stateReason\n        isAnswered @include(if: $includeIsAnswered)\n        url\n        author {\n          ...AuthorFields\n        }\n        comments(last: $lastComments) {\n          totalCount\n          nodes {\n            ...CommentFields\n            replies(last: $lastReplies) {\n              nodes {\n                ...CommentFields\n              }\n            }\n          }\n        }\n        labels(first: $firstLabels) {\n          nodes {\n            name\n          }\n        }\n      }\n    }\n  }\n": typeof types.FetchDiscussionByNumberDocument,
};
const documents: Documents = {
    "\n  fragment AuthorFields on Actor {\n    login\n    url\n    avatar_url: avatarUrl\n    type: __typename\n  }\n": types.AuthorFieldsFragmentDoc,
    "\n  fragment CommentFields on DiscussionComment {\n    databaseId\n    createdAt\n    author {\n      ...AuthorFields\n    }\n  }\n": types.CommentFieldsFragmentDoc,
    "\n  query fetchDiscussionByNumber(\n    $owner: String!\n    $name: String!\n    $number: Int!\n    $lastComments: Int\n    $lastReplies: Int\n    $firstLabels: Int\n    $includeIsAnswered: Boolean!\n  ) {\n    repository(owner: $owner, name: $name) {\n      discussion(number: $number) {\n        __typename\n        number\n        title\n        stateReason\n        isAnswered @include(if: $includeIsAnswered)\n        url\n        author {\n          ...AuthorFields\n        }\n        comments(last: $lastComments) {\n          totalCount\n          nodes {\n            ...CommentFields\n            replies(last: $lastReplies) {\n              nodes {\n                ...CommentFields\n              }\n            }\n          }\n        }\n        labels(first: $firstLabels) {\n          nodes {\n            name\n          }\n        }\n      }\n    }\n  }\n": types.FetchDiscussionByNumberDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AuthorFields on Actor {\n    login\n    url\n    avatar_url: avatarUrl\n    type: __typename\n  }\n"): typeof import('./graphql').AuthorFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CommentFields on DiscussionComment {\n    databaseId\n    createdAt\n    author {\n      ...AuthorFields\n    }\n  }\n"): typeof import('./graphql').CommentFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchDiscussionByNumber(\n    $owner: String!\n    $name: String!\n    $number: Int!\n    $lastComments: Int\n    $lastReplies: Int\n    $firstLabels: Int\n    $includeIsAnswered: Boolean!\n  ) {\n    repository(owner: $owner, name: $name) {\n      discussion(number: $number) {\n        __typename\n        number\n        title\n        stateReason\n        isAnswered @include(if: $includeIsAnswered)\n        url\n        author {\n          ...AuthorFields\n        }\n        comments(last: $lastComments) {\n          totalCount\n          nodes {\n            ...CommentFields\n            replies(last: $lastReplies) {\n              nodes {\n                ...CommentFields\n              }\n            }\n          }\n        }\n        labels(first: $firstLabels) {\n          nodes {\n            name\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').FetchDiscussionByNumberDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
