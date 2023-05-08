interface CallOtherPayload {
  data: any;
}

interface SendNotificationPayload {
  senderId: string;
  receiverId: string;
  icon: string;
  text: string;
  picture: string;
  name: string;
}

interface StopTypingMessagePayload {
  senderId: string;
  receiverId: string;
  user: string;
}

interface StartTypingMessagePayload {
  senderId: string;
  receiverId: string;
  user: string;
}

interface MessageSeenAllPayload {
  message: Message;
  currentChatId: string;
}

interface Message {
  sender: string;
  receiver: string;
  text: string;
  image: string;
  status: string;
  _id: string;
  createdAt: string;
}

interface MessageSeenPayload {
  message: Message;
  currentChatId: string;
}

interface MessageDeliveredPayload {
  message: Message;
  currentChatId: string;
}

interface SendMessagePayload {
  messages: Message;
  currentChatID: string;
}

interface AddUserPayload {
  userId: string;
  userName: string;
  picture: string;
  timeJoin: string;
}

export {
  AddUserPayload,
  CallOtherPayload,
  SendMessagePayload,
  MessageSeenPayload,
  MessageSeenAllPayload,
  MessageDeliveredPayload,
  SendNotificationPayload,
  StopTypingMessagePayload,
  StartTypingMessagePayload,
};
