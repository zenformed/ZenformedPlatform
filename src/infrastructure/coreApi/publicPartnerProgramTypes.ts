export type PublicPartnerField = { key: string; label: string; type: 'short_text' | 'long_text' | 'select' | 'boolean'; required: boolean; options?: string[] };
export type PublicPartnerProgram = { slug: string; publicName: string; publicDescription: string; termsVersion: string; applicationSchemaVersion: string; fields: PublicPartnerField[] };

function record(value: unknown): value is Record<string, unknown> { return value != null && typeof value === 'object' && !Array.isArray(value); }

export function parsePublicPartnerProgramResponse(json: unknown): PublicPartnerProgram | null {
  if (!record(json) || !record(json.program)) return null;
  const program = json.program;
  if (!record(program.applicationSchema)) return null;
  const schema = program.applicationSchema;
  const schemaFields = schema.fields;
  if (!Array.isArray(schemaFields)) return null;
  if (typeof program.slug !== 'string' || typeof program.publicName !== 'string' || typeof program.publicDescription !== 'string' || typeof program.termsVersion !== 'string' || typeof program.applicationSchemaVersion !== 'string') return null;
  const fields: PublicPartnerField[] = [];
  for (const raw of schemaFields) {
    if (!record(raw) || typeof raw.key !== 'string' || typeof raw.label !== 'string' || typeof raw.required !== 'boolean' ||
        (raw.type !== 'short_text' && raw.type !== 'long_text' && raw.type !== 'select' && raw.type !== 'boolean')) return null;
    const options = raw.type === 'select' && Array.isArray(raw.options) && raw.options.every((option) => typeof option === 'string') ? raw.options as string[] : undefined;
    if (raw.type === 'select' && options == null) return null;
    fields.push({ key: raw.key, label: raw.label, type: raw.type, required: raw.required, ...(options ? { options } : {}) });
  }
  return { slug: program.slug, publicName: program.publicName, publicDescription: program.publicDescription, termsVersion: program.termsVersion, applicationSchemaVersion: program.applicationSchemaVersion, fields };
}
