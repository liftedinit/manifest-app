import { cosmos, osmosis } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgSetDenomMetadata } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import React from 'react';

import { SigningModalDialog } from '@/components';
import { TextArea, TextInput } from '@/components/react/inputs';
import env from '@/config/env';
import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';
import Yup from '@/utils/yupExtensions';

const TokenDetailsSchema = (context: { subdenom: string }) =>
  Yup.object().shape({
    display: Yup.string().required('Display is required').noProfanity(),
    name: Yup.string().required('Name is required').noProfanity(),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters long')
      .noProfanity(),
    uri: Yup.string()
      .url('Must be a valid URL')
      .matches(/^https:\/\//i, 'URL must use HTTPS protocol')
      .matches(/\.(jpg|jpeg|png|gif)$/i, 'URL must point to an image file')
      .supportedImageUrl(),
  });

export default function UpdateDenomMetadataModal({
  isOpen,
  onClose,
  denom,
  address,
  admin,
  refetch,
  isGroup,
}: {
  isOpen: boolean;
  onClose: () => void;
  denom: ExtendedMetadataSDKType | null;
  address: string;
  admin: string;
  isGroup?: boolean;
  refetch: () => void;
}) {
  const baseDenom = denom?.base?.split('/').pop() || '';
  const fullDenom = `factory/${address}/${baseDenom}`;
  const symbol = baseDenom.slice(1).toUpperCase();
  const formData = {
    name: denom?.name || '',
    symbol: denom?.display || '',
    description: denom?.description || '',
    display: denom?.display || '',
    base: fullDenom || '',
    denomUnits: denom?.denom_units || [
      { denom: fullDenom, exponent: 0, aliases: [symbol] },
      { denom: symbol, exponent: 6, aliases: [fullDenom] },
    ],
    uri: denom?.uri || '',
    uriHash: denom?.uri_hash || '',
    subdenom: baseDenom || '',
    exponent: '6',
    label: fullDenom || '',
  };
  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { setDenomMetadata } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const queryClient = useQueryClient();
  const handleUpdate = async (values: TokenFormData, resetForm: () => void) => {
    const symbol = values.display.toUpperCase();
    try {
      const msg = isGroup
        ? submitProposal({
            groupPolicyAddress: admin,
            messages: [
              Any.fromPartial({
                typeUrl: MsgSetDenomMetadata.typeUrl,
                value: MsgSetDenomMetadata.encode({
                  sender: admin,
                  metadata: {
                    description: values.description || formData.description,
                    denomUnits: [
                      { denom: fullDenom, exponent: 0, aliases: [symbol] },
                      { denom: symbol, exponent: 6, aliases: [fullDenom] },
                    ],
                    base: fullDenom,
                    display: symbol,
                    name: values.name || formData.name,
                    symbol: symbol,
                    uri: values.uri || formData.uri,
                    uriHash: '',
                  },
                }).finish(),
              }),
            ],
            metadata: '',
            proposers: [address ?? ''],
            title: `Update ${symbol} metadata`,
            summary: `This proposal will update ${symbol}'s metadata.`,
            exec: 0,
          })
        : setDenomMetadata({
            sender: address,
            metadata: {
              description: values.description || formData.description,
              denomUnits: [
                { denom: fullDenom, exponent: 0, aliases: [symbol] },
                { denom: symbol, exponent: 6, aliases: [fullDenom] },
              ],
              base: fullDenom,
              display: symbol,
              name: values.name || formData.name,
              symbol: symbol,
              uri: values.uri || formData.uri,
              uriHash: '',
            },
          });

      await tx([msg], {
        fee: () => estimateFee(address, [msg]),
        onSuccess: () => {
          refetch();
          onClose();
        },
      });
    } catch (error) {
      console.error('Error during transaction setup:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <SigningModalDialog open={isOpen} onClose={onClose}>
      <Formik
        initialValues={formData}
        validationSchema={() => TokenDetailsSchema({ subdenom: baseDenom })}
        onSubmit={(values, { resetForm }) => handleUpdate(values, resetForm)}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isValid, dirty, values, handleChange, handleSubmit }) => (
          <>
            <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
              Update Metadata for{' '}
              <span className="font-light text-primary">
                {denom?.display?.startsWith('factory')
                  ? denom?.display?.split('/').pop()?.toUpperCase()
                  : truncateString(denom?.display ?? 'DENOM', 12)}
              </span>
            </h3>
            <div className="divider divider-horizontal -mt-4 -mb-0"></div>

            <Form className="py-4 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextInput
                  label="SUBDENOM"
                  name="subdenom"
                  value={fullDenom}
                  title={fullDenom}
                  disabled={true}
                  helperText="This field cannot be modified"
                />
                <TextInput
                  label="NAME"
                  name="name"
                  value={values.name}
                  placeholder={denom?.name}
                  onChange={handleChange}
                />
                <TextInput
                  label="LOGO URL"
                  name="uri"
                  value={values.uri}
                  placeholder={denom?.uri}
                  onChange={handleChange}
                />
                <TextInput
                  label="TICKER"
                  name="display"
                  value={values.display}
                  placeholder={denom?.display}
                  onChange={handleChange}
                />
              </div>

              <TextArea
                label="DESCRIPTION"
                name="description"
                value={values.description}
                placeholder={denom?.description}
                onChange={handleChange}
              />
            </Form>
            <div className="mt-4 flex flex-row justify-center gap-2 w-full">
              <button
                type="button"
                className="btn w-[calc(50%-8px)] btn-md focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A]"
                disabled={isSigning}
                onClick={() => onClose()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn w-1/2 btn-gradient text-white"
                onClick={() => handleSubmit()}
                disabled={isSigning || !isValid || !dirty}
              >
                {isSigning ? <span className="loading loading-dots"></span> : 'Update'}
              </button>
            </div>
          </>
        )}
      </Formik>
    </SigningModalDialog>
  );
}
