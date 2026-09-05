import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  ArrowLeft as PhosphorArrowLeft,
  ArrowRight as PhosphorArrowRight,
  ArrowUpRight as PhosphorArrowUpRight,
  CaretDown as PhosphorCaretDown,
  Check as PhosphorCheck,
  Clock as PhosphorClock,
  Globe as PhosphorGlobe,
  Leaf as PhosphorLeaf,
  Lock as PhosphorLock,
  MagnifyingGlass as PhosphorMagnifyingGlass,
  Sparkle as PhosphorSparkle,
} from "@phosphor-icons/react";

type PProps = IconProps;

function Standardized(IconComponent: Icon) {
  return function StandardizedIcon(props: PProps) {
    return <IconComponent weight="light" {...props} />;
  };
}

export const IonArrowUpRight = Standardized(PhosphorArrowUpRight);
export const IonArrowLeft = Standardized(PhosphorArrowLeft);
export const IonArrowRight = Standardized(PhosphorArrowRight);
export const IonSearch = Standardized(PhosphorMagnifyingGlass);
export const IonLock = Standardized(PhosphorLock);
export const IonCheck = Standardized(PhosphorCheck);
export const IonGlobe = Standardized(PhosphorGlobe);
export const IonChevronDown = Standardized(PhosphorCaretDown);
export const IonClock = Standardized(PhosphorClock);
export const IonLeaf = Standardized(PhosphorLeaf);
export const IonSpark = Standardized(PhosphorSparkle);