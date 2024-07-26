import axios, {
  type AxiosResponse,
  type AxiosPromise,
  type Method,
} from 'axios';
import type { Link, Token } from '../../types';

export function apiRequest(
  url: Link,
  method: Method,
  data = {},
): AxiosPromise | null {
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = 'no-cache';
  return axios({ method, url, data });
}

export async function apiRequestAuth(
  url: Link,
  method: Method,
  token: Token,
  data = {},
): AxiosPromise | null {
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common.Authorization = `token ${token}`;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = shouldRequestWithNoCache(url)
    ? 'no-cache'
    : '';

  let response: AxiosResponse | null = null;
  let combinedData: any[] = []; // Array to accumulate data from each response

  try {
    let nextUrl: string | null = url;

    // Loop to handle pagination
    while (nextUrl) {
      response = await axios({ method, url: nextUrl, data });
      combinedData = combinedData.concat(response.data); // Accumulate data

      // Check if there are additional pages
      const linkHeader = response.headers.link;
      if (hasNextLink(linkHeader)) {
        nextUrl = parseNextUrl(linkHeader);
      } else {
        nextUrl = null;
      }
    }
  } catch (error) {
    console.error('API request failed:', error);
    return null;
  }

  // Return the combined data as part of the response object
  return {
    ...response,
    data: combinedData,
  } as AxiosResponse;

  // if (url.includes("/notifications?")) {
  // 	console.log("ADAM ", JSON.stringify(response));
  // }

  // return response;
}

function shouldRequestWithNoCache(url: string) {
  const parsedUrl = new URL(url);

  switch (parsedUrl.pathname) {
    case 'notifications':
      return true;
    default:
      return false;
  }
}

function hasNextLink(linkHeader: string) {
  return linkHeader?.includes('rel="next"');
}
// Function to parse the next URL from the "Link" header
function parseNextUrl(linkHeader: string): string | null {
  const matches = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return matches ? matches[1] : null;
}
