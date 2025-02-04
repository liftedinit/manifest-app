import { createSenderReceiverHandler } from '@/components/bank/handlers/createSenderReceiverHandler';
import { QuestionIcon } from '@/components/icons/QuestionIcon';

export const DefaultHandler = createSenderReceiverHandler({
  iconSender: QuestionIcon,
  successSender: 'Unknown transaction type',
  failSender: 'Unknown transaction type',
  successReceiver: 'Unknown transaction type',
});
