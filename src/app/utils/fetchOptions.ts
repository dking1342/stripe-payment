export const fetchOptions = (val: any): RequestInit => {
  return {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(val),
  };
};
