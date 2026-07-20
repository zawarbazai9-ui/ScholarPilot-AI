type IconProps = {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
};

export function Icon({ name, className = '', fill = false, style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? 'filled' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
