import { TemplateSchema } from '../core/types/template';
import { calendarRecapTemplate } from './calendarRecap';

export const TEMPLATES: Record<string, TemplateSchema> = {
  'calendar-recap': calendarRecapTemplate,
};

export const TEMPLATE_LIST: TemplateSchema[] = [
  calendarRecapTemplate,
];

export const DEFAULT_TEMPLATE_ID = 'calendar-recap';

export function getTemplateById(id: string): TemplateSchema {
  return TEMPLATES[id] || calendarRecapTemplate;
}
