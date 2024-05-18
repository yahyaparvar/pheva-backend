export const parseMultipartResponse = (response: string): any[] => {
  const boundaryMatch = response.match(/--batch_\w+/);
  if (!boundaryMatch) {
    throw new Error("Unable to find boundary in response");
  }
  const boundary = boundaryMatch[0];
  const parts = response.split(boundary).slice(1, -1);
  return parts
    .map((part) => {
      const [headers, ...bodyParts] = part.split("\r\n\r\n").slice(1);
      const body = bodyParts.join("\r\n\r\n").trim();
      if (!body) {
        return null;
      }
      try {
        return JSON.parse(body);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    })
    .filter((part) => part !== null);
};
