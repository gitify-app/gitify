import { logError } from '../../../shared/logger';
import type { Hostname, Link, Token } from '../../types';
import { createOctokitClient } from './octokit';
import { shouldRequestWithNoCache } from './utils';

/**
 * Perform an unauthenticated API request using Octokit
 */
export async function octokitRequest(
  url: Link,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' = 'GET',
  data = {},
): Promise<any> {
  // For unauthenticated requests, we'll create a basic Octokit instance
  // Extract hostname from URL to create the client
  const urlObj = new URL(url);
  
  const { Octokit } = await import('@octokit/core');
  const baseUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.startsWith('/api/v3') ? '' : '/api/v3'}`;
  
  const octokit = new Octokit({
    baseUrl: baseUrl.endsWith('/api/v3') ? baseUrl.slice(0, -7) : baseUrl,
  });

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (shouldRequestWithNoCache(url)) {
    headers['Cache-Control'] = 'no-cache';
  }

  const endpoint = urlObj.pathname + urlObj.search;
  
  const response = await octokit.request(`${method} ${endpoint}`, {
    ...data,
    headers,
  });

  // Return axios-like response format
  return {
    data: response.data,
    status: response.status,
    statusText: 'OK',
    headers: response.headers,
  };
}

/**
 * Perform an authenticated API request using Octokit
 */
export async function octokitRequestAuth(
  url: Link,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' = 'GET',
  token: Token,
  data = {},
  fetchAllRecords = false,
): Promise<any> {
  try {
    // Extract hostname from URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname as Hostname;
    
    const octokit = await createOctokitClient(hostname, token);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (shouldRequestWithNoCache(url)) {
      headers['Cache-Control'] = 'no-cache';
    }

    // Extract the endpoint path from the URL
    let endpoint = urlObj.pathname + urlObj.search;
    
    // Remove /api/v3 prefix if present since Octokit adds it
    if (endpoint.startsWith('/api/v3/')) {
      endpoint = endpoint.substring(8);
    }

    if (!fetchAllRecords) {
      const response = await octokit.request(`${method} ${endpoint}`, {
        ...data,
        headers,
      });

      // Return axios-like response format
      return {
        data: response.data,
        status: response.status,
        statusText: 'OK',
        headers: response.headers,
      };
    }

    // Handle pagination for fetchAllRecords
    let allData: any[] = [];
    let finalResponse: any = null;
    
    try {
      // Use Octokit's paginate functionality
      const iterator = octokit.paginate.iterator(`${method} ${endpoint}`, {
        ...data,
        headers,
      });

      for await (const { data: pageData } of iterator) {
        if (Array.isArray(pageData)) {
          allData = allData.concat(pageData);
        } else {
          allData.push(pageData);
        }
      }
    } catch (err) {
      // Fallback to single request if pagination fails
      const response = await octokit.request(`${method} ${endpoint}`, {
        ...data,
        headers,
      });
      
      finalResponse = response;
      
      if (Array.isArray(response.data)) {
        allData = response.data;
      } else {
        allData = [response.data];
      }
    }

    // Return axios-like response format with combined data
    return {
      data: allData,
      status: finalResponse?.status || 200,
      statusText: 'OK',
      headers: finalResponse?.headers || {},
    };
  } catch (err) {
    logError('octokitRequestAuth', 'API request failed:', err);
    throw err;
  }
}