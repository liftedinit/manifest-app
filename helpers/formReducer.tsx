import { Duration } from "@chalabi/manifestjs/dist/codegen/google/protobuf/duration";

// Schemas for form data
export type FormData = {
  title: string;
  authors: string;
  summary: string;
  description: string;
  forumLink: string;
  votingPeriod: Duration;
  votingThreshold: string;
  members: { address: string; name: string; weight: string }[];
};

export type ProposalFormData = {
  title: string;
  proposers: string;
  summary: string;
  messages: {
    type: string;
    from_address: string;
    to_address: string;
    amount: {
      denom: string;
      amount: string;
    };
    isVisible: boolean;
  }[];
  metadata: {
    title: string;
    authors: string;
    summary: string;
    details: string;
  };
};

// Actions for form data
export type Action =
  | { type: "UPDATE_FIELD"; field: keyof FormData; value: any }
  | {
      type: "UPDATE_MEMBER";
      index: number;
      field: keyof FormData["members"][0];
      value: any;
    }
  | { type: "ADD_MEMBER"; member: FormData["members"][0] };

export type ProposalAction =
  | { type: "UPDATE_FIELD"; field: keyof ProposalFormData; value: any }
  | {
      type: "UPDATE_MESSAGE";
      index: number;
      field: keyof ProposalFormData["messages"][0];
      value: any;
    }
  | { type: "ADD_MESSAGE"; message: ProposalFormData["messages"][0] }
  | { type: "REMOVE_MESSAGE"; index: number };

// Reducers
export const formDataReducer = (state: FormData, action: Action): FormData => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };

    case "UPDATE_MEMBER":
      return {
        ...state,
        members: state.members.map((m, i) =>
          i === action.index ? { ...m, [action.field]: action.value } : m
        ),
      };

    case "ADD_MEMBER":
      return {
        ...state,
        members: [...state.members, action.member],
      };

    default:
      throw new Error("Unknown action type");
  }
};

export const proposalFormDataReducer = (
  state: ProposalFormData,
  action: ProposalAction
): ProposalFormData => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m, i) =>
          i === action.index ? { ...m, [action.field]: action.value } : m
        ),
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((_, i) => i !== action.index),
      };

    default:
      throw new Error("Unknown action type");
  }
};
