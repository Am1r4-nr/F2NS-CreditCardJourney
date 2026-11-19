import { addDays } from './usage.ts';

const compact = (iso: string) => iso.replaceAll('-', '');
const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

/**
 * Builds a calendar file with one all-day event per due date and an alert some days before.
 * Dates are YYYY-MM-DD. The `stamp` is only used for the DTSTAMP line.
 */
export function buildReminderIcs(dueDates: string[], daysBefore: number, cardName: string, stamp: Date = new Date()): string {
  const dtstamp = stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KAF First Card prototype//EN', 'CALSCALE:GREGORIAN'];
  dueDates.forEach((d, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:kaf-first-card-${compact(d)}-${i}@prototype.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(d)}`,
      `DTEND;VALUE=DATE:${compact(addDays(d, 1))}`,
      `SUMMARY:${esc(`Pay your credit card bill (${cardName})`)}`,
      `DESCRIPTION:${esc('Pay the full statement balance by today to avoid interest. Prototype reminder. We never ask for your TAC or password.')}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(`Credit card bill due in ${daysBefore} day(s)`)}`,
      `TRIGGER:-P${daysBefore}D`,
      'END:VALARM',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
