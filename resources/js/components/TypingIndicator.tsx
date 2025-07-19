interface TypingIndicatorProps {
  names: string[];
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  let prefix: string;

  if (names.length > 1) {
    prefix = `${names.length} folks are`;
  } else {
    prefix = `${names[0]} is`;
  }

  return (
    <div className="px-2 text-xs text-gray-400">{`${prefix} typing...`}</div>
  );
}