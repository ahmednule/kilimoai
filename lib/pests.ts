export type Severity = 'high' | 'medium' | 'low'
export type PestType = 'pest' | 'disease'

export interface DiseaseEntry {
  id: number
  crop: string
  disease: string
  type: PestType
  symptoms: string
  treatment: string
  prevention: string
  severity: Severity
  scientificName?: string
}

export const PEST_DISEASES: DiseaseEntry[] = [
  { id: 1, crop: 'Maize', disease: 'Maize Lethal Necrosis Disease (MLND)', type: 'disease', symptoms: 'Yellow streaks on leaves, stunted growth, dead heart leaves, poor cob formation', treatment: 'No cure. Remove and destroy infected plants. Use certified disease-free seeds.', prevention: 'Plant resistant varieties, control thrips and aphids, practice crop rotation', severity: 'high' },
  { id: 2, crop: 'Maize', disease: 'Fall Armyworm', type: 'pest', symptoms: 'Holes in leaves, window-pane damage, sawdust-like frass near whorl, damaged tassels', treatment: 'Apply neem extract or recommended pesticides early morning. Biological control with parasitoids.', prevention: 'Early planting, intercropping, scout fields weekly, use push-pull method', severity: 'high', scientificName: 'Spodoptera frugiperda' },
  { id: 3, crop: 'Maize', disease: 'Maize Streak Virus', type: 'disease', symptoms: 'Pale green to white streaks along leaf veins, stunted growth, poor grain fill', treatment: 'No cure. Remove infected plants. Control leafhopper vectors.', prevention: 'Plant resistant varieties, control leafhoppers, avoid planting near infected fields', severity: 'medium' },
  { id: 4, crop: 'Coffee', disease: 'Coffee Berry Disease (CBD)', type: 'disease', symptoms: 'Dark sunken lesions on green berries, berry drop, brown spots on leaves', treatment: 'Apply copper-based fungicides during wet season. Prune to improve air circulation.', prevention: 'Plant resistant varieties (e.g. Ruiru 11), proper spacing, regular pruning', severity: 'high' },
  { id: 5, crop: 'Coffee', disease: 'Coffee Leaf Rust', type: 'disease', symptoms: 'Yellow-orange powdery spots on undersides of leaves, leaf drop, reduced yield', treatment: 'Apply fungicides containing copper or triazoles. Remove severely infected leaves.', prevention: 'Plant resistant varieties, maintain shade levels, proper nutrition to boost plant health', severity: 'high' },
  { id: 6, crop: 'Tomato', disease: 'Late Blight', type: 'disease', symptoms: 'Water-soaked lesions on leaves and stems, white fungal growth in humid conditions, rotting fruit', treatment: 'Apply fungicides (chlorothalonil, mancozeb). Remove infected plant parts immediately.', prevention: 'Avoid overhead irrigation, ensure proper spacing, use resistant varieties', severity: 'high' },
  { id: 7, crop: 'Tomato', disease: 'Tuta Absoluta (Tomato Leaf Miner)', type: 'pest', symptoms: 'Large blotch mines in leaves, black frass inside mines, damaged fruit and stems', treatment: 'Use pheromone traps, apply recommended insecticides, remove infested leaves.', prevention: 'Use netting in nurseries, rotate with non-solanum crops, release natural enemies', severity: 'high', scientificName: 'Tuta absoluta' },
  { id: 8, crop: 'Tomato', disease: 'Bacterial Wilt', type: 'disease', symptoms: 'Sudden wilting of leaves, brown vascular tissue when stem is cut, plant collapse', treatment: 'No cure. Remove and destroy infected plants. Solarize soil before replanting.', prevention: 'Use grafted seedlings, crop rotation (avoid solanaceous crops for 3+ years), improve drainage', severity: 'high' },
  { id: 9, crop: 'Beans', disease: 'Angular Leaf Spot', type: 'disease', symptoms: 'Angular grey-brown spots on leaves, dark lesions on pods, premature defoliation', treatment: 'Apply copper-based fungicides. Use disease-free seeds.', prevention: 'Plant resistant varieties, crop rotation, avoid dense planting', severity: 'medium' },
  { id: 10, crop: 'Beans', disease: 'Anthracnose', type: 'disease', symptoms: 'Dark sunken lesions on pods, brown spots on leaves and stems, seed discoloration', treatment: 'Remove infected plants. Apply fungicides (carbendazim, mancozeb).', prevention: 'Use certified disease-free seeds, practice crop rotation, avoid working in wet fields', severity: 'medium' },
  { id: 11, crop: 'Banana', disease: 'Panama Disease (Fusarium Wilt)', type: 'disease', symptoms: 'Yellowing of lower leaves, splitting of pseudostem, vascular discoloration, wilting', treatment: 'No cure. Quarantine affected area. Use resistant varieties for replanting.', prevention: 'Plant resistant varieties (e.g. FHIA hybrids), use tissue culture plantlets, avoid contaminated tools', severity: 'high' },
  { id: 12, crop: 'Banana', disease: 'Black Sigatoka', type: 'disease', symptoms: 'Dark streaks on leaves that enlarge to black spots, premature leaf death, reduced fruit size', treatment: 'Apply fungicides (chlorothalonil, mancozeb). Remove severely affected leaves.', prevention: 'Proper spacing, regular de-leafing, plant resistant varieties', severity: 'medium' },
  { id: 13, crop: 'Potato', disease: 'Late Blight', type: 'disease', symptoms: 'Water-soaked lesions on leaves, white fungal growth on undersides, brown rotting tubers', treatment: 'Apply fungicides immediately (metalaxyl, mancozeb). Remove and destroy infected foliage.', prevention: 'Use certified disease-free seed potatoes, hill soil around stems, avoid overhead irrigation', severity: 'high' },
  { id: 14, crop: 'Potato', disease: 'Bacterial Wilt', type: 'disease', symptoms: 'Wilting of leaves, brown ring in cut tuber, ooze from cut stems, stunted growth', treatment: 'No cure. Remove and destroy infected plants. Disinfect tools.', prevention: 'Use certified clean seed, practice long crop rotation, plant resistant varieties', severity: 'high' },
]

export function cropToValue(cropName: string): string {
  const map: Record<string, string> = {
    'maize': 'maize',
    'coffee': 'coffee',
    'tomato': 'tomatoes',
    'beans': 'beans',
    'banana': 'other',
    'potato': 'potatoes',
    'tea': 'tea',
    'wheat': 'wheat',
    'rice': 'rice',
    'sorghum': 'sorghum',
    'avocado': 'avocado',
  }
  return map[cropName.toLowerCase()] ?? 'other'
}

export const CROP_VALUES = ['maize', 'coffee', 'tomatoes', 'beans', 'other', 'potatoes', 'tea', 'wheat', 'rice', 'sorghum', 'avocado'] as const
