export interface CountyData {
  name: string
  lat: number
  lng: number
  region: string
}

export const COUNTIES: CountyData[] = [
  { name: "Baringo", lat: 0.4667, lng: 35.9667, region: "Rift Valley" },
  { name: "Bomet", lat: -0.7833, lng: 35.35, region: "Rift Valley" },
  { name: "Bungoma", lat: 0.5667, lng: 34.5667, region: "Western" },
  { name: "Busia", lat: 0.45, lng: 34.1, region: "Western" },
  { name: "Elgeyo-Marakwet", lat: 0.7833, lng: 35.5667, region: "Rift Valley" },
  { name: "Embu", lat: -0.5333, lng: 37.45, region: "Eastern" },
  { name: "Garissa", lat: -0.45, lng: 39.65, region: "North Eastern" },
  { name: "Homa Bay", lat: -0.5167, lng: 34.45, region: "Nyanza" },
  { name: "Isiolo", lat: 0.35, lng: 37.5833, region: "Eastern" },
  { name: "Kajiado", lat: -1.85, lng: 36.7833, region: "Rift Valley" },
  { name: "Kakamega", lat: 0.2833, lng: 34.75, region: "Western" },
  { name: "Kericho", lat: -0.3667, lng: 35.2833, region: "Rift Valley" },
  { name: "Kiambu", lat: -1.1667, lng: 36.8333, region: "Central" },
  { name: "Kilifi", lat: -3.6333, lng: 39.85, region: "Coast" },
  { name: "Kirinyaga", lat: -0.5, lng: 37.2833, region: "Central" },
  { name: "Kisii", lat: -0.6833, lng: 34.7667, region: "Nyanza" },
  { name: "Kisumu", lat: -0.1, lng: 34.75, region: "Nyanza" },
  { name: "Kitui", lat: -1.3667, lng: 38.0167, region: "Eastern" },
  { name: "Kwale", lat: -4.1833, lng: 39.45, region: "Coast" },
  { name: "Laikipia", lat: 0.2667, lng: 36.7667, region: "Rift Valley" },
  { name: "Lamu", lat: -2.2667, lng: 40.9, region: "Coast" },
  { name: "Machakos", lat: -1.5167, lng: 37.2667, region: "Eastern" },
  { name: "Makueni", lat: -1.8, lng: 37.6167, region: "Eastern" },
  { name: "Mandera", lat: 3.9333, lng: 41.85, region: "North Eastern" },
  { name: "Marsabit", lat: 2.3333, lng: 37.9833, region: "Eastern" },
  { name: "Meru", lat: 0.05, lng: 37.65, region: "Eastern" },
  { name: "Migori", lat: -1.0667, lng: 34.4667, region: "Nyanza" },
  { name: "Mombasa", lat: -4.05, lng: 39.6667, region: "Coast" },
  { name: "Murang'a", lat: -0.7167, lng: 37.15, region: "Central" },
  { name: "Nairobi", lat: -1.2833, lng: 36.8167, region: "Nairobi" },
  { name: "Nakuru", lat: -0.3, lng: 36.0667, region: "Rift Valley" },
  { name: "Nandi", lat: 0.2, lng: 35.1, region: "Rift Valley" },
  { name: "Narok", lat: -1.0833, lng: 35.8667, region: "Rift Valley" },
  { name: "Nyamira", lat: -0.6, lng: 34.95, region: "Nyanza" },
  { name: "Nyandarua", lat: -0.1833, lng: 36.4833, region: "Central" },
  { name: "Nyeri", lat: -0.4167, lng: 36.95, region: "Central" },
  { name: "Samburu", lat: 1.1667, lng: 36.7667, region: "Rift Valley" },
  { name: "Siaya", lat: 0.0667, lng: 34.2833, region: "Nyanza" },
  { name: "Taita-Taveta", lat: -3.4, lng: 38.3667, region: "Coast" },
  { name: "Tana River", lat: -1.5, lng: 39.5, region: "Coast" },
  { name: "Tharaka-Nithi", lat: -0.15, lng: 37.7333, region: "Eastern" },
  { name: "Trans-Nzoia", lat: 1.0333, lng: 35.0167, region: "Rift Valley" },
  { name: "Turkana", lat: 3.1167, lng: 35.6, region: "Rift Valley" },
  { name: "Uasin Gishu", lat: 0.5167, lng: 35.2833, region: "Rift Valley" },
  { name: "Vihiga", lat: 0.05, lng: 34.7333, region: "Western" },
  { name: "Wajir", lat: 1.75, lng: 40.05, region: "North Eastern" },
  { name: "West Pokot", lat: 1.2333, lng: 35.1167, region: "Rift Valley" },
]

export function getCounty(name: string): CountyData | undefined {
  return COUNTIES.find(c => c.name === name)
}

export const KENYAN_COUNTIES = COUNTIES.map(c => c.name)