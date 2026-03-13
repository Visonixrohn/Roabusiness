declare module "react-world-flags" {
  import * as React from "react";

  export interface FlagProps {
    code: string;
    alt?: string;
    className?: string;
    fallback?: React.ReactNode;
  }

  const Flag: React.FC<FlagProps>;
  export default Flag;
}
