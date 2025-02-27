import * as address from '@/schemas/address';
import Yup from '@/utils/yupExtensions';

/**
 * The maximum length of the group metadata JSON string, in bytes.
 */
export const MAXIMUM_GROUP_METADATA_JSON_LENGTH = 100_000;

/**
 * Converts and validates a JSON string as a group metadata object.
 * @param json The JSON string to convert.
 * @param throws If true, throws an error if the JSON string is invalid or does not match the
 *               schema, otherwise would return `undefined`.
 * @returns The group metadata object.
 * @throws If the JSON string is invalid or does not match the schema.
 */
export function metadataFromJson(json: string, throws?: true): GroupMetadata;
export function metadataFromJson(json: string, throws: false): GroupMetadata | undefined;
export function metadataFromJson(json: string, throws: boolean = true): GroupMetadata | undefined {
  try {
    return metadataSchema.validateSync(JSON.parse(json));
  } catch (e: any) {
    if (!throws) {
      return undefined;
    }

    // If the error is due to duplicate authors, remove duplicates and try again.
    if (e instanceof Yup.ValidationError && e.type === 'array-unique-items') {
      const x = JSON.parse(json);
      return metadataSchema.validateSync({
        ...x,
        authors: [...new Set(x.authors)],
      });
    } else {
      throw e;
    }
  }
}

/**
 * Yup schema for the group metadata.
 */
export const metadataSchema = Yup.object()
  .shape({
    title: Yup.string()
      .required('Title is required')
      .max(50, 'Title must not exceed 50 characters')
      .noProfanity(),
    authors: Yup.array()
      .of(address.schema.nonNullable().required())
      .required('Authors are required')
      .unique('Authors must be unique')
      .min(1, 'At least one author is required'),
    details: Yup.string()
      .required('Details is required')
      .min(20, 'Details must be at least 20 characters')
      .max(10_000, 'Details must not exceed 10000 characters')
      .noProfanity(),
    voteOptionContext: Yup.string().optional(),
  })
  .test(
    'metadata-total-length',
    'Total metadata length must not exceed 100000 characters',
    function (values) {
      return JSON.stringify(values).length <= MAXIMUM_GROUP_METADATA_JSON_LENGTH;
    }
  );

/**
 * Schema type for the group metadata.
 */
export type GroupMetadata = Yup.InferType<typeof metadataSchema>;
