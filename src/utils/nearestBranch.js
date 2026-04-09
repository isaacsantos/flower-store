export const GEOLOCATION_ENABLED = import.meta.env.VITE_GEOLOCATION_ENABLED === 'true'

export const BRANCHES = [
  {
    id: 1,
    key: 'branch1',
    lat: 25.7472,
    lng: -100.2963,
    whatsapp: import.meta.env.VITE_BRANCH1_WHATSAPP ?? '',
  },
  {
    id: 2,
    key: 'branch2',
    lat: 25.7389,
    lng: -100.3142,
    whatsapp: import.meta.env.VITE_BRANCH2_WHATSAPP ?? '',
  },
]

const STORAGE_KEY = 'pb_nearest_branch'

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function pickNearest(lat, lng) {
  return BRANCHES.reduce((best, branch) => {
    const d = haversineKm(lat, lng, branch.lat, branch.lng)
    return d < best.dist ? { branch, dist: d } : best
  }, { branch: BRANCHES[0], dist: Infinity }).branch
}

export function getNearestBranch() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
}

export function detectNearestBranch() {
  if (!GEOLOCATION_ENABLED) return
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const nearest = pickNearest(coords.latitude, coords.longitude)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nearest))
    },
    () => {
      // Permission denied or unavailable — leave whatever is stored
    },
    { timeout: 8000, maximumAge: 1000 * 60 * 60 * 24 } // cache 24h
  )
}
