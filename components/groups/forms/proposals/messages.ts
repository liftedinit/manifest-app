import { CustomMessage, RemoveValidatorMessage, SendMessage, UpdatePoaParamsMessage } from "@/helpers";

export const initialSendMessage: SendMessage = {
    type: "send",
    from_address: "",
    to_address: "",
    amount: { denom: "", amount: "" },

  };
  
  export const initialCustomMessage: CustomMessage = {
    type: "customMessage",
    custom_field: "",

  };
  
  export const initialUpdatePoaParamsMessage: UpdatePoaParamsMessage = {
    type: "updatePoaParams",
    sender: "",
    params: {
      admins: [],
      allow_validator_self_exit: false,
    },

  };
  
  export const initialRemoveValidatorMessage: RemoveValidatorMessage = {
    type: "removeValidator",
    sender: "",
    validator_address: "",
    
  };

  // Poa Messages
export const initialUpdateStakingParamsMessage = {
    type: "updateStakingParams",
    sender: "",
    params: {
      unbonding_time: { seconds: BigInt(0), nanos: 0 },
      max_validators: 0,
      max_entries: 0,
      historical_entries: 0,
      bond_denom: "",
      min_commission_rate: "",
    },
    
  };
  
  export const initialRemovePendingMessage = {
    type: "removePending",
    sender: "",
    validator_address: "",
    
  };
  
  export const initialSetPowerMessage = {
    type: "setPower",
    sender: "",
    validator_address: "",
    power: BigInt(0),
    unsafe: true,
    
  };
  
  // Manifest Messages
  export const initialUpdateManifestParamsMessage = {
    type: "updateManifestParams",
    authority: "",
    params: {
      stake_holders: [{ address: "", percentage: 0 }],
      inflation: {
        automatic_enabled: true,
        mint_denom: "umfx",
        yearly_amount: BigInt(1000000000),
      },
    },
    
  };
  
  export const initialPayoutStakeholdersMessage = {
    type: "payoutStakeholders",
    authority: "",
    payout: { denom: "", amount: "" },
    
  };
  
  // Group Messages
  export const initialUpdateGroupAdminMessage = {
    type: "updateGroupAdmin",
    new_admin: "",
    group_id: BigInt(0),
    admin: "",
    
  };
  
  export const initialUpdateGroupMembersMessage = {
    type: "updateGroupMembers",
    group_id: BigInt(0),
    admin: "",
    member_updates: [{ address: "", weight: "", metadata: "", added_at: {} as Date }],
    
  };
  
  export const initialUpdateGroupMetadataMessage = {
    type: "updateGroupMetadata",
    group_id: BigInt(0),
    admin: "",
    metadata: "",
    
  };
  
  export const initialUpdateGroupPolicyAdminMessage = {
    type: "updateGroupPolicyAdmin",
    new_admin: "",
    admin: "",
    address: "",
    
  };
  
  export const initialCreateGroupWithPolicyMessage = {
    type: "createGroupWithPolicy",
    admin: "",
    group_metadata: "",
    group_policy_as_admin: true,
    group_policy_metadata: "",
    members: [{ address: "", weight: "", metadata: "", added_at: {} as Date }],
    
  };
  
  export const initialSubmitProposalMessage = {
    type: "submitProposal",
    proposers: [""],
    messages: [],
    metadata: "",
    address: "",
    exec: 0,
    
  };
  
  export const initialVoteMessage = {
    type: "vote",
    voter: "",
    proposal_id: BigInt(0),
    option: 1,
    metadata: "",
    exec: 0,
    
  };
  
  export const initialWithdrawProposalMessage = {
    type: "withdrawProposal",
    proposal_id: BigInt(0),
    address: "",
    
  };
  
  export const initialExecMessage = {
    type: "exec",
    proposal_id: BigInt(0),
    signer: "",
    
  };
  
  export const initialLeaveGroupMessage = {
    type: "leaveGroup",
    group_id: BigInt(0),
    address: "",
    
  };
  
  // Cosmos Messages
  export const initialMultiSendMessage = {
    type: "multiSend",
    inputs: [{ address: "", coins: [{ denom: "", amount: "" }] }],
    outputs: [{ address: "", coins: [{ denom: "", amount: "" }] }],
    
  };
  
  export const initialSoftwareUpgradeMessage = {
    type: "softwareUpgrade",
    authority: "",
    plan: { name: "", time: {} as Date, height: BigInt(0), info: "" },
    
  };
  
  export const initialCancelUpgradeMessage = {
    type: "cancelUpgrade",
    authority: "",
    
  };