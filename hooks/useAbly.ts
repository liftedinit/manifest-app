import { useState, useEffect } from "react";
import { useChannel } from "ably/react";
import { Message, RealtimeChannel } from "ably";
const useAbly = (channelName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchHistory = async (channel: RealtimeChannel) => {
    const resultPage = await channel.history({ limit: 100 });
    const historyMessages = resultPage.items.reverse();
    setMessages(historyMessages);
  };

  const { channel } = useChannel(channelName, (message: Message) => {
    setMessages((prev) => [...prev, message]);
  });

  useEffect(() => {
    fetchHistory(channel);
  }, [channel]);

  return { messages, channel };
};

export default useAbly;
