/** en.icue.vn owns only its React home; subpage metadata lives on icue.vn. */
export const ROUTE_META = []

export const ROUTE_META_BY_PATH = Object.fromEntries(
  ROUTE_META.map((entry) => [entry.path, entry]),
)

export const DEFAULT_META = {
  title: 'iCUE Vietnam | Innovation Center',
  description: 'Official website of iCUE Vietnam (Innovation Center). Explore our projects, community activities, news, and contact information.',
}
