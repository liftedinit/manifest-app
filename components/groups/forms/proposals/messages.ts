import { CustomMessage, RemoveValidatorMessage, SendMessage, UpdatePoaParamsMessage } from "@/helpers";
import {manifest, cosmos, strangelove_ventures} from "@chalabi/manifestjs";


// Poa Messages
const {updateParams: updatePoaParams, updateStakingParams, removeValidator, removePending, setPower} = strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
const msgUpdatePoaParams = updatePoaParams({
    sender: "address",
    params: {
        admins: [""],
        allow_validator_self_exit: true,
    }
});
const msgUpdateStakingParams = updateStakingParams({
    sender: "address",
    params: {
       unbonding_time: {seconds: BigInt(0), nanos: 0},
         max_validators: 0,
            max_entries: 0,
            historical_entries: 0,
            bond_denom: "",
            min_commission_rate: ""
    }
});
const msgRemoveValidator = removeValidator({
    sender: "address",
    validator_address: ""
});
const msgRemovePending = removePending({
    sender: "address",
    validator_address: ""
});
const msgSetPower = setPower({
    sender: "address",
    validator_address: "",
    power: BigInt(0),
    unsafe: true
});
// Manifest Messages
const { updateParams: updateManifestParams, payoutStakeholders  } = manifest.v1.MessageComposer.withTypeUrl;
const msgUpdateManifestParams = updateManifestParams({
    authority: "address",
    params: {
        
        stake_holders: [{address: "", percentage: 0}],
        inflation: {automatic_enabled: true, mint_denom: "umfx", yearly_amount: BigInt(1000000000)}, 
       
    }
});
const msgPayoutStakeholders = payoutStakeholders({
    authority: "address",
   payout: {denom: "", amount: ""}
  
});
// Group Messages
const {updateGroupAdmin, updateGroupMembers, updateGroupMetadata, updateGroupPolicyAdmin, createGroupWithPolicy, submitProposal, vote, withdrawProposal, exec, leaveGroup } = cosmos.group.v1.MessageComposer.withTypeUrl;
const msgUpdateGroupAdmin = updateGroupAdmin({
    new_admin: "address",
    group_id: BigInt(0),
    admin: "address"
});
const msgUpdateGroupMembers = updateGroupMembers({
    group_id: BigInt(0),
    admin: "address",
    member_updates: [{address: "", weight: "", metadata: "", added_at: {} as Date}]
});
const msgUpdateGroupMetadata = updateGroupMetadata({
    group_id: BigInt(0),
    admin: "address",
    metadata: ""
});
const msgUpdateGroupPolicyAdmin = updateGroupPolicyAdmin({
   new_admin: "address",
   admin: "address",
   address: "address"
});
const msgCreateGroupWithPolicy = createGroupWithPolicy({
    admin: "address",
    group_metadata: "",
    group_policy_as_admin: true,
    group_policy_metadata: "",
    members: [{address: "", weight: "", metadata: "", added_at: {} as Date}],
});
const msgSubmitProposal = submitProposal({
    proposers: [""],
    messages: [],
    metadata: "",
    group_policy_address: "",
    exec: 1
});
const msgVote = vote({
    voter: "address",
    proposal_id: BigInt(0),
    option: 1,
    metadata: "",
    exec: 0
});
const msgWithdrawProposal = withdrawProposal({
    proposal_id: BigInt(0),
    address: ""
});
const msgExec = exec({
    proposal_id: BigInt(0),
   signer: "address"
});
const msgLeaveGroup = leaveGroup({
    group_id: BigInt(0),
    address: ""
});
// Cosmos Messages
const { send, multiSend } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;
const msgSend = send({
    from_address: "address",
    to_address: "address",
    amount: [{denom: "", amount: ""}]
});
const msgMultiSend = multiSend({
    inputs: [{address: "", coins: [{denom: "", amount: ""}]}],
    outputs: [{address: "", coins: [{denom: "", amount: ""}]}]
});
const { softwareUpgrade, cancelUpgrade } = cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl;
const msgSoftwareUpgrade = softwareUpgrade({
   authority: "address",
    plan: {name: "", time: {} as Date, height: BigInt(0), info: ""} 
});
const msgCancelUpgrade = cancelUpgrade({
    authority: "address"
});

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
    exec: 1,
    
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