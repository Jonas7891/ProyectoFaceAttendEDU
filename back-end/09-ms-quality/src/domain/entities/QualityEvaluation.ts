// Entidad de dominio: evaluación de calidad ISO 25010 aplicada a un CRUD/servicio.
export type EvaluationStatus = 'Draft' | 'Completed';

export interface QualityEvaluation {
  evaluationId: number;
  service: string; // ej: "01-ms-identity", "03-ms-academic", ...
  evaluator: string;
  scope: string; // ej: "CRUD cities", "CRUD enrollments"
  scores: Record<string, number>; // subcharacteristicId -> 1..5
  comments?: string;
  status: EvaluationStatus;
  globalScore?: number;
  percentage?: number;
  level?: string;
  byCharacteristic?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
