/**
 * Reusable method for sending HTTP requests and processing output.
 * @param url The URL to send the request to.
 * @param method The HTTP method for the request.
 * @param body The body of the request.
 * @param headers The headers of the request.
 * @returns
 */
const request = async (
  url: string,
  method = "GET",
  body = {},
  headers = {},
) => {
  const USER_ID = import.meta.env.VITE_API_ID;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const options: RequestInit = {
    method: method,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-ID": USER_ID,
      "API-Secret": API_KEY,
    },
  };
  if (Object.keys(body).length) {
    Object.assign(options, {
      body: JSON.stringify(body),
    });
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok && response.status !== 204) {
      throw new Error(response.statusText);
    } else if (response.status === 204) {
      return response.text();
    } else {
      console.log(response.status);
    }
    return response.json();
  } catch (err) {
    console.log(`Something went wrong!\n${err}`);
  }
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Creates the reusable API calls.
 * @param resource Indicates the resource to use in the API request. For example, in /api/flyer, the resource is 'flyer'.
 * @returns
 */
export const useApi = (resource = "") => {
  /**
   * Executes a GET request.
   * @param id The ID of the document to retrieve.
   * @param additional in case the URL needs to be extended: for example,/products/{{PRODUCT_ID}}/attributes, where /attributes is additional.
   * @returns
   */
  const get = async (id: string, additional: string = "") => {
    if (!id) {
      let add = additional ? "/" + additional : "";
      return request(`${BASE_URL}${"/" + resource + add}`, "GET");
    }
    return request(`${BASE_URL}${"/" + resource}/${id + additional}`, "GET");
  };

  const post = async (data = {}, id = "") => {
    if (!id) {
      return request(`${BASE_URL}${"/" + resource}`, "POST", data);
    }
    return request(`${BASE_URL}${"/" + resource + "/" + id}`, "POST", data);
  };

  const patch = async (id = "", data = {}) => {
    if (!id) {
      return alert("ID is required for PATCH request");
    }
    return request(`${BASE_URL}${"/" + resource}/${id}`, "PATCH", data);
  };

  const del = async (id = "") => {
    if (!id) {
      return alert("ID is required for DELETE request");
    }
    return request(`${BASE_URL}${"/" + resource}/${id}`, "DELETE");
  };

  return { get, post, patch, del };
};
