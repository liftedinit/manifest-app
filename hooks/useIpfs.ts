// hooks/useIPFSFetch.ts
import { useState, useEffect } from 'react';

const useIPFSFetch = (cid : string) => {
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!cid) {
            setError(new Error("CID is required"));
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://nodes.chandrastation.com/ipfs/gateway/${cid}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }
                const content = await response.text();
                setData(content);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [cid]);

    return { data, loading, error };
};

export default useIPFSFetch;


export const uploadJsonToIPFS = async (jsonString: BlobPart) => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'groupMetadata.json');

        const response = await fetch('http://66.172.36.138:5001/api/v0/add', {
            method: 'POST',
            body: formData
        });


        if (!response.ok) {
            throw new Error(`Failed to upload to IPFS: ${response.status} ${response.statusText}`);
          }
        
          const data = await response.json();
          return data.Hash; 
        };