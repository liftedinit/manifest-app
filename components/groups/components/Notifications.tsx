import React, { useState } from "react";
import { ChannelProvider } from "ably/react";
import useAbly from "@/hooks/useAbly";

interface NotificationsProps {
  groupPolicyAddress: string;
}

const NotificationsComponent: React.FC<NotificationsProps> = ({
  groupPolicyAddress,
}) => {
  const { messages } = useAbly(`group-${groupPolicyAddress}`);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        Notifications ({messages.length})
      </button>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Notifications</h3>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  <div className="font-bold">{msg.data.title}</div>
                  <div>{msg.data.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(msg.data.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
            <div className="modal-action">
              <button onClick={() => setIsOpen(false)} className="btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Notifications: React.FC<NotificationsProps> = ({
  groupPolicyAddress,
}) => {
  return (
    <ChannelProvider channelName={`group-${groupPolicyAddress}`}>
      <NotificationsComponent groupPolicyAddress={groupPolicyAddress} />
    </ChannelProvider>
  );
};

export default Notifications;
