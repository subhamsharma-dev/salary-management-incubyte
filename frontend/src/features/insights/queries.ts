import { useQuery } from '@tanstack/react-query'

import {
  getInsightsByCountry,
  getInsightsByCountryJobTitle,
  type CountryInsight,
  type CountryJobTitleInsight,
} from '@/lib/api'

export function useInsightsByCountry() {
  return useQuery<CountryInsight[]>({
    queryKey: ['insights', 'by-country'],
    queryFn: getInsightsByCountry,
  })
}

export function useInsightsByCountryJobTitle() {
  return useQuery<CountryJobTitleInsight[]>({
    queryKey: ['insights', 'by-country-job-title'],
    queryFn: getInsightsByCountryJobTitle,
  })
}
