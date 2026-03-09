/**
 * Section type registry for headless CMS block editor.
 * Generic: supports any section type. Register types for labels/defaults; unknown types use {}.
 */
export interface SectionTypeDefinition {
    type: string;
    label: string;
    defaultContent?: Record<string, unknown>;
}

/** Extensible registry - add types via registerSectionType() */
const registry: Map<string, SectionTypeDefinition> = new Map();

export function registerSectionType(def: SectionTypeDefinition): void {
    registry.set(def.type, def);
}

export function getSectionTypeDef(type: string): SectionTypeDefinition | undefined {
    return registry.get(type);
}

/** Returns default content for a type. Unknown types get {}. */
export function getDefaultContent(type: string): Record<string, unknown> {
    const def = registry.get(type);
    return def?.defaultContent ?? {};
}

export function getRegisteredTypes(): SectionTypeDefinition[] {
    return Array.from(registry.values());
}

export function generateSectionKey(type: string): string {
    return `${type.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
}
