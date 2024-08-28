export const fetchFromIPFS = async (cid: string): Promise<any> => {
  const url = `https://ipfs.io/ipfs/${cid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS data for CID: ${cid}`);
  }
  return response.json();
};
