/**
 * Letter avatar, Spotify-style: first letter of the name in a bright
 * primary circle. If an image URL is provided (user.avatar), it shows
 * instead. Server-safe, no client JS.
 */
const SIZES = {
  sm: { box: 'h-9 w-9', text: 'text-sm' },
  md: { box: 'h-12 w-12', text: 'text-lg' },
  xl: { box: 'h-24 w-24 sm:h-28 sm:w-28', text: 'text-4xl sm:text-5xl' },
} as const;

export function UserAvatar({
  name,
  src,
  size = 'md',
  className = '',
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${s.box} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${s.box} rounded-full bg-primary text-primary-foreground font-display font-extrabold inline-flex items-center justify-center shrink-0 select-none ${s.text} ${className}`}
    >
      {letter}
    </span>
  );
}