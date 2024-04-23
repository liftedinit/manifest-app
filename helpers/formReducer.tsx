export type FormData = {
  title: string;
  authors: string;
  summary: string;
  description: string;
  forumLink: string;
  votingPeriod: string;
  votingThreshold: string;
  members: { address: string; name: string; weight: string }[];
};

export type Action =
  | { type: "UPDATE_FIELD"; field: keyof FormData; value: any }
  | {
      type: "UPDATE_MEMBER";
      index: number;
      field: keyof FormData["members"][0];
      value: any;
    }
  | { type: "ADD_MEMBER"; member: FormData["members"][0] };

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
