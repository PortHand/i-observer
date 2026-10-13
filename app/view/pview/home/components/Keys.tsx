import { formatKeys, type Platform } from "../helper/homeHelper";

export default function Keys({ accelerator, platform }: { accelerator: string; platform: Platform }) {
  return (
    <span className="keys">
      {formatKeys(accelerator, platform).map((key) => (
        <kbd key={key}>{key}</kbd>
      ))}
    </span>
  );
}
