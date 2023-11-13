export function ViewBothIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path className="fill-price-lower" d="M2.667 2.667h4.666v4.667H2.667V2.667Z" />
      <path className="fill-price-higher" d="M2.667 8.667h4.666v4.667H2.667V8.667Z" />
      <path
        className="fill-primary"
        fillRule="evenodd"
        d="M8.667 2.667h4.666v2.667H8.667V2.667Zm0 4h4.666v2.667H8.667V6.667Zm4.666 4H8.667v2.667h4.666v-2.667Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ViewLongIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path className="fill-price-higher" d="M2.667 2.667h4.666v10.667H2.667V2.667Z" />
      <path
        className="fill-primary"
        fillRule="evenodd"
        d="M8.667 2.667h4.666v2.667H8.667V2.667Zm0 4h4.666v2.667H8.667V6.667Zm4.666 4H8.667v2.667h4.666v-2.667Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ViewShortIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path className="fill-price-lower" d="M2.667 2.667h4.666v10.667H2.667V2.667Z" />
      <path
        className="fill-primary"
        fillRule="evenodd"
        d="M8.667 2.667h4.666v2.667H8.667V2.667Zm0 4h4.666v2.667H8.667V6.667Zm4.666 4H8.667v2.667h4.666v-2.667Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
