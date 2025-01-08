import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { cosmos } from '@liftedinit/manifestjs';
import { useTx, useFeeEstimation, useGitHubReleases, GitHubRelease, useBlockHeight } from '@/hooks';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgSoftwareUpgrade } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { TextInput } from '@/components/react/inputs';
import { PiCaretDownBold } from 'react-icons/pi';
import { SearchIcon } from '@/components/icons';
import env from '@/config/env';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: string;
  address: string;
  refetchPlan: () => void;
}

interface UpgradeInfo {
  name: string;
  upgradeable: boolean;
  commitHash: string;
}

const parseReleaseBody = (body: string): UpgradeInfo | null => {
  try {
    const nameMatch = body.match(/- \*\*Upgrade Handler Name\*\*: (.*?)(?:\r?\n|$)/);
    const upgradeableMatch = body.match(/- \*\*Upgradeable\*\*: (.*?)(?:\r?\n|$)/);
    const commitHashMatch = body.match(/- \*\*Commit Hash\*\*: (.*?)(?:\r?\n|$)/);

    if (!nameMatch || !upgradeableMatch || !commitHashMatch) {
      console.warn('Failed matches:', { nameMatch, upgradeableMatch, commitHashMatch });
      return null;
    }

    return {
      name: nameMatch[1].trim(),
      upgradeable: upgradeableMatch[1].trim().toLowerCase() === 'true',
      commitHash: commitHashMatch[1].trim(),
    };
  } catch (error) {
    console.error('Error parsing release body:', error);
    return null;
  }
};

const UpgradeSchema = Yup.object().shape({
  height: Yup.number()
    .typeError('Height must be a number')
    .required('Height is required')
    .integer('Must be a valid number')
    .test(
      'min-height',
      'Height must be at least 1000 blocks above current height',
      function (inputHeight) {
        const proposedHeight = Number(inputHeight);
        const chainHeight = Number(this.options.context?.chainData?.currentHeight || 0);

        if (Number.isNaN(proposedHeight) || Number.isNaN(chainHeight)) {
          return false;
        }

        const minimumAllowedHeight = chainHeight + 1000;

        return proposedHeight >= minimumAllowedHeight;
      }
    ),
});

export function UpgradeModal({ isOpen, onClose, admin, address, refetchPlan }: BaseModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { releases, isReleasesLoading } = useGitHubReleases();

  const { blockHeight } = useBlockHeight();

  // Filter releases that are upgradeable
  const upgradeableReleases = useMemo(() => {
    const allReleases = [...(releases || [])];
    return allReleases
      .map(release => ({
        ...release,
        upgradeInfo: parseReleaseBody(release.body),
      }))
      .filter(release => release.upgradeInfo?.upgradeable);
  }, [releases]);

  const filteredReleases = upgradeableReleases.filter(release =>
    release.tag_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const { softwareUpgrade } = cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const handleUpgrade = async (values: {
    name: string;
    height: string;
    info: string;
    selectedVersion: (GitHubRelease & { upgradeInfo?: UpgradeInfo | null }) | null;
  }) => {
    setIsSigning(true);

    const selectedRelease = values.selectedVersion;
    const binaryLinks: { [key: string]: string } = {};

    // Map assets to their platform-specific links
    selectedRelease?.assets?.forEach(asset => {
      if (asset.name.includes('linux-amd64')) {
        binaryLinks['linux/amd64'] = asset.browser_download_url;
      } else if (asset.name.includes('linux-arm64')) {
        binaryLinks['linux/arm64'] = asset.browser_download_url;
      } else if (asset.name.includes('darwin-amd64')) {
        binaryLinks['darwin/amd64'] = asset.browser_download_url;
      } else if (asset.name.includes('darwin-arm64')) {
        binaryLinks['darwin/arm64'] = asset.browser_download_url;
      }
    });

    const infoObject = {
      commitHash: values.selectedVersion?.upgradeInfo?.commitHash || '',
      binaries: binaryLinks,
    };

    const msgUpgrade = softwareUpgrade({
      plan: {
        name: values.name,
        height: BigInt(values.height),
        time: new Date(0),
        info: JSON.stringify(infoObject),
      },
      authority: admin,
    });

    const anyMessage = Any.fromPartial({
      typeUrl: msgUpgrade.typeUrl,
      value: MsgSoftwareUpgrade.encode(msgUpgrade.value).finish(),
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: [anyMessage],
      metadata: '',
      proposers: [address ?? ''],
      title: `Upgrade the chain`,
      summary: `This proposal will upgrade the chain`,
      exec: 0,
    });

    const fee = await estimateFee(address ?? '', [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {
        setIsSigning(false);
        refetchPlan();
      },
    });
    setIsSigning(false);
  };

  const initialValues = {
    name: '',
    height: '',
    info: '',
    selectedVersion: null as (GitHubRelease & { upgradeInfo?: UpgradeInfo | null }) | null,
  };
  const validationContext = useMemo(
    () => ({
      chainData: {
        currentHeight: Number(blockHeight),
      },
    }),
    [blockHeight]
  );
  const modalContent = (
    <dialog
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: isOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={UpgradeSchema}
        validate={values => {
          return UpgradeSchema.validate(values, { context: validationContext })
            .then(() => ({}))
            .catch(err => {
              return err.errors.reduce((acc: { [key: string]: string }, curr: string) => {
                acc[err.path] = curr;
                return acc;
              }, {});
            });
        }}
        onSubmit={values => {
          handleUpgrade({
            name: values.selectedVersion?.upgradeInfo?.name || '',
            height: values.height,
            info: values.selectedVersion?.upgradeInfo?.commitHash || '',
            selectedVersion: values.selectedVersion,
          });
        }}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isValid, dirty, values, handleChange, handleSubmit, setFieldValue, resetForm }) => (
          <div className="modal-box max-w-4xl mx-auto min-h-[30vh] max-h-[70vh] rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg overflow-y-auto">
            <form method="dialog">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
              >
                ✕
              </button>
            </form>
            <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">
              Chain Upgrade
            </h3>

            <Form className="py-4 space-y-6">
              <div className="grid gap-6">
                <div className="w-full">
                  <label className="label">
                    <span className="label-text text-md font-medium text-[#00000099] dark:text-[#FFFFFF99]">
                      VERSION
                    </span>
                  </label>
                  <div className="relative">
                    <div className="dropdown dropdown-end w-full">
                      <label
                        aria-label="version-selector"
                        tabIndex={0}
                        className="btn btn-md w-full justify-between border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] hover:bg-transparent"
                        style={{ borderRadius: '12px' }}
                      >
                        {values.selectedVersion?.tag_name || 'Select Version'}
                        <PiCaretDownBold className="ml-1" />
                      </label>
                      <ul
                        tabIndex={0}
                        role="listbox"
                        aria-label="Version selection"
                        className="dropdown-content z-20 p-2 shadow bg-base-300 rounded-lg w-full mt-1 max-h-72 overflow-y-auto dark:text-[#FFFFFF] text-[#161616]"
                      >
                        <li className="bg-base-300 z-30 hover:bg-transparent h-full mb-2">
                          <div className="px-2 py-1 relative">
                            <input
                              type="text"
                              placeholder="Search versions..."
                              className="input input-sm w-full pr-8 focus:outline-none focus:ring-0 border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A]"
                              onChange={e => setSearchTerm(e.target.value)}
                              style={{ boxShadow: 'none', borderRadius: '8px' }}
                            />
                            <SearchIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </li>
                        {isReleasesLoading ? (
                          <li>
                            <a className="block px-4 py-2">Loading versions...</a>
                          </li>
                        ) : (
                          filteredReleases?.map(release => (
                            <li
                              key={release.id}
                              onClick={e => {
                                setFieldValue('selectedVersion', release);
                                setFieldValue('name', release.upgradeInfo?.name || '');
                                setFieldValue('info', release.upgradeInfo?.commitHash || '');
                                // Get the dropdown element and remove focus
                                const dropdown = (e.target as HTMLElement).closest('.dropdown');
                                if (dropdown) {
                                  (dropdown as HTMLElement).removeAttribute('open');
                                  (dropdown.querySelector('label') as HTMLElement)?.focus();
                                  (dropdown.querySelector('label') as HTMLElement)?.blur();
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setFieldValue('selectedVersion', release);
                                  setFieldValue('name', release.upgradeInfo?.name || '');
                                  setFieldValue('info', release.upgradeInfo?.commitHash || '');
                                  // Get the dropdown element and remove focus
                                  const dropdown = (e.target as HTMLElement).closest('.dropdown');
                                  if (dropdown) {
                                    (dropdown as HTMLElement).removeAttribute('open');
                                    (dropdown.querySelector('label') as HTMLElement)?.focus();
                                    (dropdown.querySelector('label') as HTMLElement)?.blur();
                                  }
                                }
                              }}
                              className="hover:bg-[#E0E0FF33] dark:hover:bg-[#FFFFFF0F] cursor-pointer rounded-lg"
                            >
                              <a className="flex flex-row items-center gap-2 px-2 py-2">
                                <span className="truncate">{release.tag_name}</span>
                              </a>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <TextInput
                  label={`HEIGHT (Current: ${blockHeight})`}
                  name="height"
                  type="number"
                  value={values.height}
                  onChange={handleChange}
                  placeholder="Block height for upgrade"
                  min="0"
                />
                <TextInput
                  label="NAME"
                  name="name"
                  value={values.selectedVersion?.upgradeInfo?.name || ''}
                  disabled={true}
                  placeholder="Name will be set from version"
                />
                <TextInput
                  label="COMMIT HASH"
                  name="info"
                  value={values.selectedVersion?.upgradeInfo?.commitHash || ''}
                  disabled={true}
                  placeholder="Commit hash will appear here"
                />
              </div>

              <div className="mt-4 flex flex-row justify-center gap-2 w-full">
                <button
                  type="button"
                  className="btn w-1/2 focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A] dark:text-white text-black"
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn w-1/2 btn-gradient text-white"
                  onClick={() => handleSubmit()}
                  disabled={isSigning || !isValid || !dirty || !values.selectedVersion}
                >
                  {isSigning ? <span className="loading loading-dots"></span> : 'Upgrade'}
                </button>
              </div>
            </Form>
          </div>
        )}
      </Formik>
      <form
        method="dialog"
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onSubmit={onClose}
      >
        <button>close</button>
      </form>
    </dialog>
  );

  // Only render if we're in the browser
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
