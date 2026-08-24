export interface CollectionPoint {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string; // Primary category, e.g. "Eletrônicos", "Recicláveis", "Orgânicos", "Vidros", "Óleo Usado"
  address: string;
  hours: string; // Opening hours
  phone: string;
  rating: number; // Star rating (1-5)
  acceptedMaterials: string[]; // List of materials accepted (e.g. ["Baterias", "Celulares", "Notebooks"])
}
