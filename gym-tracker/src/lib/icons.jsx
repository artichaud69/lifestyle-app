// A small hand-picked set of stroke icons (feather-style paths) so the app
// never depends on an icon font or external asset just to draw a checkmark.
function Icon({ children, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export const DumbbellIcon = (props) => (
  <Icon {...props}>
    <path d="M6.5 6.5 17.5 17.5" />
    <path d="M4 4l2.5 2.5M20 20l-2.5-2.5" />
    <path d="M2.5 5.5l3 3M18.5 15.5l3 3" />
    <rect x="3.2" y="9.3" width="4" height="5.4" rx="1.3" transform="rotate(-45 5.2 12)" />
    <rect x="16.8" y="9.3" width="4" height="5.4" rx="1.3" transform="rotate(-45 18.8 12)" />
  </Icon>
)

export const HistoryIcon = (props) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v4h4" />
    <path d="M12 7v5l3 3" />
  </Icon>
)

export const ChartIcon = (props) => (
  <Icon {...props}>
    <path d="M4 20V10M11 20V4M18 20v-7" />
  </Icon>
)

export const CalendarIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 3v3M16 3v3" />
  </Icon>
)

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const XIcon = (props) => (
  <Icon {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)

export const ChevronRightIcon = (props) => (
  <Icon {...props}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
)

export const TrashIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7M6 7l1 12.2c0 .8.7 1.4 1.5 1.4h6.9c.8 0 1.5-.6 1.5-1.4L18 7" />
  </Icon>
)

export const AwardIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="5.2" />
    <path d="M9 12.5 7.5 21 12 18.5 16.5 21 15 12.5" />
  </Icon>
)

export const AlertIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3.5 2 20.5h20L12 3.5Z" />
    <path d="M12 10v4.2M12 17.2v.1" />
  </Icon>
)

export const TrendUpIcon = (props) => (
  <Icon {...props}>
    <path d="M3 17 9.5 10.5 14 15l7-8" />
    <path d="M17 7h4v4" />
  </Icon>
)

export const PlayIcon = (props) => (
  <Icon {...props}>
    <path d="M6 4.5v15l14-7.5-14-7.5Z" />
  </Icon>
)

export const EditIcon = (props) => (
  <Icon {...props}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5.5 16.5a1 1 0 0 0-.3.6L4 20Z" />
    <path d="M13.5 8.5l2 2" />
  </Icon>
)

export const SettingsIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2.1 2.1 0 1 1-3 3l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2.1 2.1 0 1 1-4.2 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2.1 2.1 0 1 1-3-3l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2.1 2.1 0 1 1 0-4.2h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2.1 2.1 0 1 1 3-3l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2.1 2.1 0 1 1 4.2 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2.1 2.1 0 1 1 3 3l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2.1 2.1 0 1 1 0 4.2h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
)

export const FlameIcon = (props) => (
  <Icon {...props}>
    <path d="M12 2.5s5 4.7 5 9.8a5 5 0 0 1-10 0c0-1 .3-1.9.8-2.7.4.9 1.2 1.5 1.7 1.2-.6-1.7-.2-4.3 2.5-6.5Z" />
  </Icon>
)

export const DownloadIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4.5 17.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
  </Icon>
)

export const CopyIcon = (props) => (
  <Icon {...props}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.8" />
    <path d="M15.5 8.5V6a1.8 1.8 0 0 0-1.8-1.8H6A1.8 1.8 0 0 0 4.2 6v7.7A1.8 1.8 0 0 0 6 15.5h2.5" />
  </Icon>
)

export const LinkIcon = (props) => (
  <Icon {...props}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M11 7.5 13.2 5.3a3.2 3.2 0 0 1 4.5 4.5L15.5 12" />
    <path d="M13 16.5 10.8 18.7a3.2 3.2 0 0 1-4.5-4.5L8.5 12" />
  </Icon>
)

export const UnlinkIcon = (props) => (
  <Icon {...props}>
    <path d="M11 7.5 13.2 5.3a3.2 3.2 0 0 1 4.5 4.5L15.5 12" />
    <path d="M13 16.5 10.8 18.7a3.2 3.2 0 0 1-4.5-4.5L8.5 12" />
    <path d="M4 4l16 16" />
  </Icon>
)

export const ScaleIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="12" cy="12.5" r="3.4" />
    <path d="M12 9.1v1.4M14.4 14.9l-1.7-1.7" />
    <path d="M7.5 4V2.6M16.5 4V2.6" />
  </Icon>
)

export const TargetIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </Icon>
)

export const ChevronUpIcon = (props) => (
  <Icon {...props}>
    <path d="M6 15l6-6 6 6" />
  </Icon>
)

export const ChevronDownIcon = (props) => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)

export const BookIcon = (props) => (
  <Icon {...props}>
    <path d="M3.5 5.2c2.3-1 4.8-1 8 0v13.6c-3.2-1-5.7-1-8 0V5.2Z" />
    <path d="M20.5 5.2c-2.3-1-4.8-1-8 0v13.6c3.2-1 5.7-1 8 0V5.2Z" />
  </Icon>
)
