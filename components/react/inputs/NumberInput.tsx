import React from "react";
import { BaseInput } from "./BaseInput";

export const NumberInput: React.FC<React.ComponentProps<typeof BaseInput>> = (
  props,
) => <BaseInput type="number" {...props} />;
